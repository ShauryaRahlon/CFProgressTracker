import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Performance from '@/models/Performance';
import Student from '@/models/Student';
import { auth } from "@/lib/auth";

export const revalidate = 3600;
export async function GET(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const { id } = await params;
        const contestId = parseInt(id);
        if (isNaN(contestId)) {
            return NextResponse.json({ error: "Invalid Contest ID" }, { status: 400 });
        }
        const results = await Performance.find({ contestId: contestId })
            .sort({ rank: 1 })
            .populate({
                path: 'student',
                model: Student,
                select: 'name enrolment batch'
            })
            .lean();
        return NextResponse.json(results);
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 });
    }
}