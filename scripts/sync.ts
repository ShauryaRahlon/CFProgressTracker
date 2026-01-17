import fetch from 'node-fetch';
import dotenv from 'dotenv';
import path from 'path';
import { connectDB } from '../src/lib/db';
import Contest from '../src/models/Contest';
import Student from '../src/models/Student';
import Performance from '../src/models/Performance';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
const CF_API = "https://codeforces.com/api";
const BATCH_SIZE = 50;
const DELAY_MS = 2000;
const START_TIMESTAMP = 1767225600;
function getClassification(name: string): string {
    if (name.includes("Div. 1") && name.includes("Div. 2")) return "Div. 1 + Div. 2";
    if (name.includes("Div. 1")) return "Div. 1";
    if (name.includes("Div. 2")) return "Div. 2";
    if (name.includes("Div. 3")) return "Div. 3";
    if (name.includes("Div. 4")) return "Div. 4";
    if (name.includes("Educational")) return "Educational";
    if (name.includes("Global")) return "Global";
    if (name.includes("ICPC")) return "ICPC";
    return "Other";
}
async function syncContestList() {
    console.log("🔄 Fetching contest list...");
    const response = await fetch(`${CF_API}/contest.list`);
    const data: any = await response.json();
    if (data.status !== 'OK') {
        throw new Error(data.comment);
    }
    const relevantContests = [];
    const sortedContests = data.result.sort((a: any, b: any) => b.startTimeSeconds - a.startTimeSeconds);
    for (const c of sortedContests) {
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
        relevantContests.push(c);
    }
    console.log(`✅ Found ${relevantContests.length} new contests.`);
    return relevantContests;
}
async function syncPerformances(contests: any[]) {
    const students = await Student.find({}).select('cfHandle _id');
    if (!students.length) return;
    console.log(`📊 Syncing results for ${students.length} students...`);
    for (const contest of contests) {
        console.log(`   ➡️ Processing ${contest.name}...`);
        for (let i = 0; i < students.length; i += BATCH_SIZE) {
            const batch = students.slice(i, i + BATCH_SIZE);
            const handles = batch.map(s => s.cfHandle).join(';');
            const url = `${CF_API}/contest.standings?contestId=${contest.id}&handles=${handles}&showUnofficial=true`;
            try {
                const res = await fetch(url);
                const data: any = await res.json();
                if (data.status !== 'OK') continue;
                const rows = data.result?.rows || [];
                if (!rows.length) continue;
                const ops = rows.map((row: any) => {
                    const party = row.party;
                    const handle = party.members[0]?.handle;
                    if (party.participantType !== 'CONTESTANT' &&
                        party.participantType !== 'OUT_OF_COMPETITION') {
                        return null;
                    }
                    if (!handle) return null;
                    const student = batch.find(
                        s => s.cfHandle.toLowerCase() === handle.toLowerCase()
                    );
                    if (!student) return null;
                    return {
                        updateOne: {
                            filter: {
                                contestId: contest.id,
                                student: student._id
                            },
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
                                    participantType: party.participantType
                                }
                            },
                            upsert: true
                        }
                    };
                }).filter(Boolean);
                if (ops.length) {
                    await Performance.bulkWrite(ops);
                    console.log(`      Saved ${ops.length} live results.`);
                }
            } catch (err) {
                console.error(`      Error processing batch:`, err);
            }
            await new Promise(r => setTimeout(r, DELAY_MS));
        }
    }
}
async function main() {
    try {
        await connectDB();
        const contests = await syncContestList();
        await syncPerformances(contests);
        console.log("🚀 Sync Complete");
        process.exit(0);
    } catch (err) {
        console.error("Fatal Error:", err);
        process.exit(1);
    }
}
main();