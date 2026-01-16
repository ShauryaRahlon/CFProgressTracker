import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Student from '@/models/Student';
import Performance from '@/models/Performance';
import { auth } from "@/lib/auth";
export const revalidate = 3600;
export async function GET(
    req: NextRequest,
    { params }: { params: { handle: string } }
) {
    try {
        await connectDB();
        const session = await auth();
        if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        const handle = params.handle;
        const student = await Student.findOne({
            cfHandle: { $regex: new RegExp(`^${handle}$`, 'i') }
        }).select('-createdAt -updatedAt');
        if (!student) {
            return NextResponse.json({ error: "Student not found" }, { status: 404 });
        }
        const history = await Performance.find({ handle: student.cfHandle })
            .sort({ contestId: -1 })
            .populate({
                path: 'contest',
                select: 'name startTimeSeconds classification'
            })
            .lean();
        return NextResponse.json({
            profile: student,
            history: history
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Server Error" }, { status: 500 });
    }
}