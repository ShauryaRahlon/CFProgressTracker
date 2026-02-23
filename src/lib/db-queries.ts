import { connectDB } from '@/lib/db';
import Contest from '@/models/Contest';
import Performance from '@/models/Performance';
import Student from '@/models/Student';

export type StudentListItem = {
    _id: string;
    name: string;
    enrolment: string;
    batch: string;
    cfHandle: string;
};

export type GetStudentsResponse = {
    data: StudentListItem[];
    pagination: { total: number; page: number; pages: number };
};

const PAGE_SIZE = 20;

// ─── Types (kept compatible with existing page usage) ────────────────────────

export type ContestRow = {
    _id: string;
    id: number;
    name: string;
    type: string;
    phase: string;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    classification: string;
};

export type ContestPagination = {
    total: number;
    page: number;
    pages: number;
};

export type GetContestsResponse = {
    data: ContestRow[];
    pagination: ContestPagination;
};

export type StudentRank = {
    _id: string;
    contestId: number;
    student: {
        _id: string;
        name: string;
        enrolment: string;
        batch: string;
    };
    handle: string;
    rank: number;
    points: number;
    penalty: number;
    solvedCount: number;
};

export type StudentProfile = {
    profile: {
        _id: string;
        name: string;
        enrolment: string;
        batch: string;
        cfHandle: string;
    };
    history: {
        _id: string;
        contestId: number;
        rank: number;
        points: number;
        penalty: number;
        solvedCount: number;
        handle: string;
        contest: {
            _id: string;
            id: number;
            name: string;
            classification: string;
            startTimeSeconds: number;
        };
    }[];
};

// ─── getContests ─────────────────────────────────────────────────────────────

export async function getContests({
    page = 1,
    type,
    search,
}: {
    page?: number;
    type?: string;
    search?: string;
}): Promise<GetContestsResponse> {
    await connectDB();

    const filter: Record<string, any> = { phase: 'FINISHED' };
    if (type && type !== 'All') {
        filter.classification = type;
    }
    if (search && search.trim()) {
        filter.name = new RegExp(search.trim(), 'i');
    }

    const total = await Contest.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, page), pages);

    const raw = await Contest.find(filter)
        .sort({ startTimeSeconds: -1 })
        .skip((safePage - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean();

    const data: ContestRow[] = raw.map((c: any) => ({
        _id: c._id.toString(),
        id: c.id,
        name: c.name,
        type: c.type,
        phase: c.phase,
        frozen: c.frozen,
        durationSeconds: c.durationSeconds,
        startTimeSeconds: c.startTimeSeconds,
        classification: c.classification,
    }));

    return { data, pagination: { total, page: safePage, pages } };
}

// ─── getContest (leaderboard for a single contest) ───────────────────────────

export async function getContest(contestId: number): Promise<StudentRank[]> {
    await connectDB();

    const rows = await Performance.find({ contestId })
        .populate('student', 'name enrolment batch')
        .sort({ rank: 1 })
        .lean();

    return rows
        .filter((r: any) => r.student)
        .map((r: any) => ({
            _id: r._id.toString(),
            contestId: r.contestId,
            student: {
                _id: r.student._id.toString(),
                name: r.student.name,
                enrolment: r.student.enrolment,
                batch: r.student.batch,
            },
            handle: r.handle,
            rank: r.rank,
            points: r.points,
            penalty: r.penalty,
            solvedCount: r.solvedCount,
        }));
}

// ─── getContestById ───────────────────────────────────────────────────────────

export async function getContestById(id: number): Promise<ContestRow | null> {
    await connectDB();
    const c = await Contest.findOne({ id }).lean() as any;
    if (!c) return null;
    return {
        _id: c._id.toString(),
        id: c.id,
        name: c.name,
        type: c.type,
        phase: c.phase,
        frozen: c.frozen,
        durationSeconds: c.durationSeconds,
        startTimeSeconds: c.startTimeSeconds,
        classification: c.classification,
    };
}

// ─── getStudent ───────────────────────────────────────────────────────────────

export async function getStudent(handle: string): Promise<StudentProfile | null> {
    await connectDB();

    const student = await Student.findOne({
        cfHandle: { $regex: new RegExp(`^${handle}$`, 'i') },
    }).lean() as any;

    if (!student) return null;

    const performances = await Performance.find({ student: student._id })
        .populate({
            path: 'contest',
            select: 'id name classification startTimeSeconds',
        })
        .sort({ 'contest.startTimeSeconds': -1 })
        .lean();

    const history = performances
        .filter((p: any) => p.contest)
        .map((p: any) => ({
            _id: p._id.toString(),
            contestId: p.contestId,
            rank: p.rank,
            points: p.points,
            penalty: p.penalty,
            solvedCount: p.solvedCount,
            handle: p.handle,
            contest: {
                _id: p.contest._id.toString(),
                id: p.contest.id,
                name: p.contest.name,
                classification: p.contest.classification,
                startTimeSeconds: p.contest.startTimeSeconds,
            },
        }));

    return {
        profile: {
            _id: student._id.toString(),
            name: student.name,
            enrolment: student.enrolment,
            batch: student.batch,
            cfHandle: student.cfHandle,
        },
        history,
    };
}

// ─── getStudents ─────────────────────────────────────────────────────────────

export async function getStudents({
    page = 1,
    search,
}: {
    page?: number;
    search?: string;
}): Promise<GetStudentsResponse> {
    await connectDB();

    const filter: Record<string, any> = {};
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), 'i');
        filter.$or = [
            { name: regex },
            { cfHandle: regex },
            { enrolment: regex },
            { batch: regex },
        ];
    }

    const total = await Student.countDocuments(filter);
    const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const safePage = Math.min(Math.max(1, page), pages);

    const raw = await Student.find(filter)
        .sort({ name: 1 })
        .skip((safePage - 1) * PAGE_SIZE)
        .limit(PAGE_SIZE)
        .lean();

    const data: StudentListItem[] = (raw as any[]).map((s) => ({
        _id: s._id.toString(),
        name: s.name,
        enrolment: s.enrolment,
        batch: s.batch,
        cfHandle: s.cfHandle,
    }));

    return { data, pagination: { total, page: safePage, pages } };
}
