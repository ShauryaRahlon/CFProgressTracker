export interface IStudent {
    name: string;
    enrolment: string;
    cfHandle: string;
    batch: string;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
export interface IContest {
    id: number;
    name: string;
    type: string;
    classification: string;
    phase: string;
    frozen: boolean;
    durationSeconds: number;
    startTimeSeconds: number;
    relativeTimeSeconds?: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
export interface IPerformance {
    student: string | IStudent;
    contestId: number;
    handle: string;
    rank: number;
    solvedCount: number;
    points: number;
    penalty: number;
}