import mongoose, { Schema, Document, Model } from 'mongoose';
import { IContest } from '@/types';

interface IContestDocument extends IContest, Document { }

const ContestSchema = new Schema<IContestDocument>(
    {
        id: {
            type: Number,
            required: true,
            unique: true,
            index: true
        },
        name: {
            type: String,
            required: true
        },
        type: {
            type: String,
            default: 'CF'
        },
        classification: {
            type: String,
            default: 'Other',
            index: true
        },
        phase: {
            type: String,
            required: true
        },
        frozen: {
            type: Boolean,
            default: false
        },
        durationSeconds: {
            type: Number,
            default: 0
        },
        startTimeSeconds: {
            type: Number,
            required: true,
            index: true
        },
        relativeTimeSeconds: {
            type: Number
        }
    },
    {
        timestamps: true
    }
);

const Contest: Model<IContestDocument> = mongoose.models.Contest || mongoose.model<IContestDocument>('Contest', ContestSchema);
export default Contest;