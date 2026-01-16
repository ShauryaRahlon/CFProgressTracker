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
        const rawData = XLSX.utils.sheet_to_json(sheet);
        if (rawData.length === 0) {
            return NextResponse.json({ error: 'Sheet is empty' }, { status: 400 });
        }
        await connectDB();
        const ops = rawData.map((row: any) => ({
            updateOne: {
                filter: { enrolment: row.Enrolment.toString().trim().toUpperCase() },
                update: {
                    $set: {
                        name: row.Name.trim(),
                        cfHandle: row.Handle.toString().trim(),
                        batch: row.Batch.toString().trim(),
                    }
                },
                upsert: true
            }
        }));
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