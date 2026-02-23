import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { connectDB } from '@/lib/db';
import Contest from '@/models/Contest';
import Student from '@/models/Student';
import Performance from '@/models/Performance';

const CF_API = 'https://codeforces.com/api';
const BATCH_SIZE = 50;
const DELAY_MS = 2000;
const START_TIMESTAMP = 1767225600; // Jan 1, 2026

function getClassification(name: string): string {
    if (name.includes('Div. 1') && name.includes('Div. 2')) return 'Div. 1 + Div. 2';
    if (name.includes('Div. 1')) return 'Div. 1';
    if (name.includes('Div. 2')) return 'Div. 2';
    if (name.includes('Div. 3')) return 'Div. 3';
    if (name.includes('Div. 4')) return 'Div. 4';
    if (name.includes('Educational')) return 'Educational';
    if (name.includes('Global')) return 'Global';
    if (name.includes('ICPC')) return 'ICPC';
    return 'Other';
}

export async function POST() {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
        }

        await connectDB();

        // --- Step 1: Sync contest list from CF ---
        const cfRes = await fetch(`${CF_API}/contest.list`, { cache: 'no-store' });
        const cfData: any = await cfRes.json();
        if (cfData.status !== 'OK') {
            return NextResponse.json({ error: `CF API error: ${cfData.comment}` }, { status: 502 });
        }

        const sorted = cfData.result.sort((a: any, b: any) => b.startTimeSeconds - a.startTimeSeconds);
        const allFinished: any[] = [];
        for (const c of sorted) {
            if (c.startTimeSeconds < START_TIMESTAMP) break;
            if (c.phase !== 'FINISHED') continue;
            await Contest.findOneAndUpdate(
                { id: c.id },
                {
                    id: c.id,
                    name: c.name,
                    type: c.type,
                    classification: getClassification(c.name),
                    phase: c.phase,
                    frozen: c.frozen,
                    durationSeconds: c.durationSeconds,
                    startTimeSeconds: c.startTimeSeconds,
                },
                { upsert: true }
            );
            allFinished.push(c);
        }

        // --- Step 2: Find contests with NO performance records yet ---
        const syncedContestIds = await Performance.distinct('contestId');
        const newContests = allFinished.filter((c) => !syncedContestIds.includes(c.id));

        if (newContests.length === 0) {
            return NextResponse.json({
                message: 'Already up-to-date. No new contests to sync.',
                contestsAdded: allFinished.length,
                newContestsSynced: 0,
                performancesSaved: 0,
            });
        }

        // --- Step 3: Sync performances only for new contests ---
        const allStudents = await Student.find({}).select('cfHandle _id');

        // Pre-validate handles in batches of 10 — CF rejects the whole batch if any handle is invalid
        const validStudents: typeof allStudents = [];
        for (let i = 0; i < allStudents.length; i += 10) {
            const batch = allStudents.slice(i, i + 10);
            const handlesParam = batch.map(s => s.cfHandle).filter(Boolean).join(';');
            if (!handlesParam) continue;
            try {
                const r = await fetch(`${CF_API}/user.info?handles=${handlesParam}`, { cache: 'no-store' });
                const d: any = await r.json();
                if (d.status === 'OK') {
                    const validHandlesSet = new Set(d.result.map((u: any) => u.handle.toLowerCase()));
                    validStudents.push(...batch.filter(s => validHandlesSet.has(s.cfHandle.toLowerCase())));
                } else {
                    // One bad handle in this batch — check individually
                    for (const student of batch) {
                        if (!student.cfHandle) continue;
                        try {
                            const r2 = await fetch(`${CF_API}/user.info?handles=${student.cfHandle}`, { cache: 'no-store' });
                            const d2: any = await r2.json();
                            if (d2.status === 'OK') validStudents.push(student);
                        } catch { /* skip this handle */ }
                        await new Promise((r) => setTimeout(r, 100));
                    }
                }
            } catch {
                validStudents.push(...batch); // network error — include anyway
            }
            await new Promise((r) => setTimeout(r, 200));
        }


        const students = validStudents;
        console.log(`[SYNC] allStudents: ${allStudents.length}, validStudents: ${students.length}`);
        let totalPerformancesSaved = 0;

        for (const contest of newContests) {
            for (let i = 0; i < students.length; i += BATCH_SIZE) {
                const batch = students.slice(i, i + BATCH_SIZE);
                const handles = batch.map((s) => s.cfHandle).join(';');
                const url = `${CF_API}/contest.standings?contestId=${contest.id}&handles=${handles}&showUnofficial=true`;

                try {
                    const res = await fetch(url, { cache: 'no-store' });
                    const data: any = await res.json();
                    if (data.status !== 'OK') continue;

                    const rows = data.result?.rows || [];
                    if (!rows.length) continue;

                    const ops = rows.map((row: any) => {
                        const party = row.party;
                        const handle = party.members[0]?.handle;
                        if (
                            party.participantType !== 'CONTESTANT' &&
                            party.participantType !== 'OUT_OF_COMPETITION'
                        ) return null;
                        if (!handle) return null;

                        const student = batch.find(
                            (s) => s.cfHandle.toLowerCase() === handle.toLowerCase()
                        );
                        if (!student) return null;

                        return {
                            updateOne: {
                                filter: { contestId: contest.id, student: student._id },
                                update: {
                                    $set: {
                                        contestId: contest.id,
                                        student: student._id,
                                        handle,
                                        rank: row.rank,
                                        points: row.points,
                                        penalty: row.penalty,
                                        solvedCount: row.problemResults.filter(
                                            (p: any) => p.points > 0
                                        ).length,
                                        participantType: party.participantType,
                                    },
                                },
                                upsert: true,
                            },
                        };
                    }).filter(Boolean);

                    if (ops.length) {
                        await Performance.bulkWrite(ops);
                        totalPerformancesSaved += ops.length;
                    }
                } catch {
                    // skip failed batch, continue
                }

                await new Promise((r) => setTimeout(r, DELAY_MS));
            }
        }

        return NextResponse.json({
            message: `Sync complete! ${newContests.length} new contest(s) processed.`,
            contestsAdded: allFinished.length,
            newContestsSynced: newContests.length,
            performancesSaved: totalPerformancesSaved,
        });
    } catch (error: any) {
        console.error('Sync error:', error);
        return NextResponse.json({ error: error.message || 'Internal server error' }, { status: 500 });
    }
}
