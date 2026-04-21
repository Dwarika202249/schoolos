import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IStudentMark extends Document {
  schoolId: Types.ObjectId;
  examScheduleId: Types.ObjectId;
  studentId: Types.ObjectId;
  
  obtainedMarks: number;
  percentage: number;
  grade: string;
  
  status: 'PRESENT' | 'ABSENT' | 'EXCUSED';
  remarks?: string;
  
  isDeleted: boolean;
  markedBy: Types.ObjectId;
}

const studentMarkSchema = new Schema<IStudentMark>(
  {
    ...(baseFields as any),
    examScheduleId: { type: Schema.Types.ObjectId, ref: 'ExamSchedule', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    
    obtainedMarks: { type: Number, required: true },
    percentage: { type: Number, required: true },
    grade: String,
    
    status: { type: String, enum: ['PRESENT', 'ABSENT', 'EXCUSED'], default: 'PRESENT' },
    remarks: String,
    markedBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  baseSchemaOptions
);

// One result per student per exam
studentMarkSchema.index({ examScheduleId: 1, studentId: 1 }, { unique: true });

export const StudentMark = model<IStudentMark>('StudentMark', studentMarkSchema);
