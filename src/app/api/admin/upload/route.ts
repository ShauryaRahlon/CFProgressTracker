import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import * as XLSX from 'xlsx';
import Student from '@/models/Student';
import { connectDB } from '@/lib/db';
export async function POST(req: NextRequest) {
    try {
        const session = await auth();
        if (!session || session.user.role !== 'admin') {
            return NextResponse.json({ error: 'Unauthorized: Admins only' }, { status: 403 });
        }
        const formData = await req.formData();
        const file = formData.get('file') as File;
        if (!file) {
            return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
        }
        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const workbook = XLSX.read(buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        // Read raw rows (as arrays) to auto-detect which row is the header
        const rawRows: any[][] = XLSX.utils.sheet_to_json(sheet, { header: 1 });
        const headerRowIndex = rawRows.findIndex((row: any[]) =>
            row.some((cell: any) => typeof cell === 'string' && cell.toLowerCase().includes('name')) &&
            row.some((cell: any) => typeof cell === 'string' && cell.toLowerCase().includes('enrollment') || (typeof cell === 'string' && cell.toLowerCase().includes('enrolment')))
        );
        if (headerRowIndex === -1) {
            return NextResponse.json({ error: `Could not find header row. Found columns: ${rawRows[0]?.join(', ')}` }, { status: 400 });
        }
        const rawData = XLSX.utils.sheet_to_json(sheet, { range: headerRowIndex });
        if (rawData.length === 0) {
            return NextResponse.json({ error: 'Sheet is empty' }, { status: 400 });
        }
        await connectDB();

        const getField = (row: any, ...keys: string[]) => {
            for (const k of keys) {
                if (row[k] !== undefined && row[k] !== null && row[k] !== '') return row[k];
            }
            // fallback: partial match
            const found = Object.keys(row).find(rk => keys.some(k => rk.toLowerCase().includes(k.toLowerCase())));
            return found ? row[found] : undefined;
        };

        const ops = rawData
            .map((row: any) => {
                const name = getField(row, 'Name')?.toString().trim();
                const enrolment = getField(row, 'Enrollment Number', 'Enrolment', 'Enrolment Number', 'enrollment')?.toString().trim().toUpperCase();
                const cfHandle = getField(row, 'Official Codeforces Handle / id', 'Handle', 'Codeforces Handle', 'CF Handle', 'handle')?.toString().trim();
                const batchKey = Object.keys(row).find(k => k.toLowerCase().startsWith('batch'));
                const batch = (batchKey ? row[batchKey] : getField(row, 'Batch'))?.toString().trim();
                return { name, enrolment, cfHandle, batch };
            })
            .filter(r => r.enrolment) // only skip rows with no enrollment number
            .map(({ name, enrolment, cfHandle, batch }) => ({
                updateOne: {
                    filter: { enrolment },
                    update: { $set: { name, cfHandle, batch } },
                    upsert: true,
                }
            }));

        if (ops.length === 0) {
            return NextResponse.json({ error: 'No valid rows found. Check column names match: Enrollment Number, Name, Official Codeforces Handle / id, Batch.' }, { status: 400 });
        }

        const result = await Student.bulkWrite(ops);
        return NextResponse.json({
            message: 'Upload successful',
            stats: {
                matched: result.matchedCount,
                modified: result.modifiedCount,
                upserted: result.upsertedCount
            }
        });
    } catch (error: any) {
        console.error('Upload Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}