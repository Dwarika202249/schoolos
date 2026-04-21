import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IExamSchedule extends Document {
  schoolId: Types.ObjectId;
  examTermId: Types.ObjectId;
  classId: Types.ObjectId;
  subjectId: Types.ObjectId;
  
  examDate: Date;
  startTime?: string;
  duration?: string; // e.g. "3 Hours"
  
  maxMarks: number;
  passingMarks: number;
  
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const examScheduleSchema = new Schema<IExamSchedule>(
  {
    ...(baseFields as any),
    examTermId: { type: Schema.Types.ObjectId, ref: 'ExamTerm', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    
    examDate: { type: Date, required: true },
    startTime: String,
    duration: String,
    
    maxMarks: { type: Number, required: true, default: 100 },
    passingMarks: { type: Number, required: true, default: 33 },
  },
  baseSchemaOptions
);

// Compound index to prevent duplicate papers for same subject in same term/class
examScheduleSchema.index({ examTermId: 1, classId: 1, subjectId: 1 }, { unique: true });

export const ExamSchedule = model<IExamSchedule>('ExamSchedule', examScheduleSchema);
