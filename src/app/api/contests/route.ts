import { NextRequest, NextResponse } from 'next/server';
import { connectDB } from '@/lib/db';
import Contest from '@/models/Contest';
import { auth } from "@/lib/auth";

export const revalidate = 3600;

export async function GET(req: NextRequest) {
    try {
        const session = await auth();
        if (!session?.user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }
        await connectDB();
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get('page') || '1');
        const type = searchParams.get('type');
        const limit = 20;
        const query: any = {};
        if (type && type !== 'All') {
            query.classification = type;
        }

        const contests = await Contest.find(query)
            .sort({ startTimeSeconds: -1 })
            .skip((page - 1) * limit)
            .limit(limit)
            .lean();

        const totalDocs = await Contest.countDocuments(query);
        return NextResponse.json({
            data: contests,
            pagination: {
                total: totalDocs,
                page: page,
                pages: Math.ceil(totalDocs / limit),
            }
        });
    } catch (error) {
        console.error("API Error:", error);
        return NextResponse.json({ error: "Failed to fetch contests" }, { status: 500 });
    }
}