import mongoose, { Schema, Document, Model } from 'mongoose';
import { IPerformance } from '@/types';

interface IPerformanceDocument extends IPerformance, Document { }

const PerformanceSchema = new Schema<IPerformanceDocument>(
    {
        student: {
            type: Schema.Types.ObjectId,
            ref: 'Student',
            required: true
        },
        contestId: {
            type: Number,
            required: true
        },
        handle: {
            type: String,
            required: true
        },
        rank: {
            type: Number,
            required: true
        },
        solvedCount: {
            type: Number,
            default: 0
        },
        points: {
            type: Number,
            default: 0
        },
        penalty: {
            type: Number,
            default: 0
        },
    },
    {
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);
PerformanceSchema.virtual('contest', {
    ref: 'Contest',
    localField: 'contestId',
    foreignField: 'id',
    justOne: true
});

PerformanceSchema.index({ contestId: 1, rank: 1 });
PerformanceSchema.index({ handle: 1, contestId: -1 });
PerformanceSchema.index({ contestId: 1, handle: 1 }, { unique: true });

const Performance: Model<IPerformanceDocument> = mongoose.models.Performance || mongoose.model<IPerformanceDocument>('Performance', PerformanceSchema);
export default Performance;