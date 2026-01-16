import mongoose, { Schema, Document, Model } from 'mongoose';
import { IStudent } from '@/types';

interface IStudentDocument extends IStudent, Document { }

const StudentSchema = new Schema<IStudentDocument>(
    {
        name: {
            type: String,
            required: true,
            trim: true
        },
        enrolment: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
            trim: true
        },
        cfHandle: {
            type: String,
            required: true,
            unique: true,
            trim: true,
            index: true
        },
        batch: {
            type: String,
            required: true,
            index: true
        },
    },
    {
        timestamps: true,
        collation: { locale: 'en', strength: 2 }
    }
);

const Student: Model<IStudentDocument> = mongoose.models.Student || mongoose.model<IStudentDocument>('Student', StudentSchema);
export default Student;