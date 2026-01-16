import { NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Performance from '@/models/Performance';

export const revalidate = 3600;
export async function GET(
    { params }: { params: { id: string } }
) {
    try {
        await connectDB();
        const contestId = parseInt(params.id);
        const results = await Performance.find({ contestId: contestId })
            .sort({ rank: 1 })
            .populate({
                path: 'student',
                select: 'name enrolment batch'
            })
            .lean();
        return NextResponse.json(results);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
    }
}