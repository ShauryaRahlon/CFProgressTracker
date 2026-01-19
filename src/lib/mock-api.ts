export type Contest = {
    _id: string;
    id: number;
    name: string;
    type: "CF" | "ICPC" | "Other";
    phase: "FINISHED" | "BEFORE" | "CODING";
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    classification: "Div. 1" | "Div. 2" | "Div. 3" | "Other";
};

export type ContestPagination = {
    total: number;
    page: number;
    pages: number;
};

export type GetContestsResponse = {
    data: Contest[];
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

const MOCK_CONTESTS: Contest[] = [
    {
        _id: "696bd7c17cc8a9fa08cdc810",
        id: 2191,
        classification: "Div. 2",
        durationSeconds: 10800,
        frozen: false,
        name: "Codeforces Round 1073 (Div. 2)",
        phase: "FINISHED",
        startTimeSeconds: 1768660500,
        type: "CF",
    },
    {
        _id: "696bd7c17cc8a9fa08cdc80f",
        id: 2190,
        classification: "Div. 1",
        durationSeconds: 10800,
        frozen: false,
        name: "Codeforces Round 1073 (Div. 1)",
        phase: "FINISHED",
        startTimeSeconds: 1768660500,
        type: "CF",
    },
    {
        _id: "696bd0767cc8a9fa08cdc61a",
        id: 2184,
        classification: "Div. 3",
        durationSeconds: 8100,
        frozen: false,
        name: "Codeforces Round 1072 (Div. 3)",
        phase: "FINISHED",
        startTimeSeconds: 1768228500,
        type: "ICPC",
    },
    {
        _id: "696bd0767cc8a9fa08cdc61b",
        id: 2183,
        classification: "Other",
        durationSeconds: 10800,
        frozen: false,
        name: "Hello 2026",
        phase: "FINISHED",
        startTimeSeconds: 1767796500,
        type: "CF",
    },
];

const MOCK_LEADERBOARD: Record<number, StudentRank[]> = {
    2184: [
        {
            _id: "696bd0817cc8a9fa08cdc61c",
            contestId: 2184,
            student: {
                _id: "696bcee37cc8a9fa08cdc603",
                enrolment: "9923103156",
                batch: "F5",
                name: "Khushi Yadav",
            },
            handle: "Kushi",
            penalty: 424,
            points: 6,
            rank: 827,
            solvedCount: 6,
        },
        {
            _id: "696bd0817cc8a9fa08cdc61d",
            student: {
                _id: "696bcee37cc8a9fa08cdc604",
                enrolment: "9924103256",
                batch: "F9",
                name: "Shahin Khan",
            },
            contestId: 2184,
            handle: "_SHAHIN",
            penalty: 162,
            points: 4,
            rank: 2420,
            solvedCount: 4,
        },
        {
            _id: "696bd0817cc8a9fa08cdc61e",
            student: {
                _id: "696bcee37cc8a9fa08cdc5fe",
                enrolment: "9923103167",
                batch: "F7",
                name: "Shaurya Rahlon",
            },
            contestId: 2184,
            handle: "Shaurya003",
            penalty: 76,
            points: 3,
            rank: 5191,
            solvedCount: 3,
        },
    ],
};

const MOCK_STUDENTS: Record<string, StudentProfile> = {
    _SHAHIN: {
        profile: {
            _id: "696bcee37cc8a9fa08cdc604",
            enrolment: "9924103256",
            batch: "F9",
            cfHandle: "_SHAHIN",
            name: "Shahin Khan",
        },
        history: [
            {
                _id: "696bd7c27cc8a9fa08cdc811",
                contestId: 2191,
                rank: 2817,
                points: 3447,
                penalty: 0,
                solvedCount: 4,
                handle: "_SHAHIN",
                contest: {
                    _id: "696bd7c17cc8a9fa08cdc810",
                    id: 2191,
                    classification: "Div. 2",
                    name: "Codeforces Round 1073 (Div. 2)",
                    startTimeSeconds: 1768660500,
                },
            },
            {
                _id: "696bd0817cc8a9fa08cdc61d",
                contestId: 2184,
                rank: 2420,
                points: 4,
                penalty: 162,
                solvedCount: 4,
                handle: "_SHAHIN",
                contest: {
                    _id: "696bd0767cc8a9fa08cdc61a",
                    id: 2184,
                    classification: "Div. 3",
                    name: "Codeforces Round 1072 (Div. 3)",
                    startTimeSeconds: 1768228500,
                },
            },
            {
                _id: "696bd0847cc8a9fa08cdc620",
                contestId: 2183,
                rank: 3047,
                points: 3192,
                penalty: 0,
                solvedCount: 4,
                handle: "_SHAHIN",
                contest: {
                    _id: "696bd0767cc8a9fa08cdc61b",
                    id: 2183,
                    classification: "Other",
                    name: "Hello 2026",
                    startTimeSeconds: 1767796500,
                },
            },
        ],
    },
};

export async function getContests({
    page = 1,
    type,
}: {
    page?: number;
    type?: string;
}): Promise<GetContestsResponse> {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    let filtered = [...MOCK_CONTESTS];
    if (type && type !== "All") {
        filtered = filtered.filter((c) => c.classification === type);
    }

    // Simple pagination logic for mock
    const total = filtered.length;
    const pageSize = 10;
    const pages = Math.ceil(total / pageSize);

    // For this mock, we just return everything if pages <= 1
    return {
        data: filtered,
        pagination: {
            total,
            page,
            pages: Math.max(1, pages),
        },
    };
}

export async function getContest(id: number): Promise<StudentRank[]> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_LEADERBOARD[id] || [];
}

export async function getStudent(handle: string): Promise<StudentProfile | null> {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return MOCK_STUDENTS[handle] || null;
}
