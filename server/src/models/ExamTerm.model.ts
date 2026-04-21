import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IExamTerm extends Document {
  schoolId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  name: string;      // e.g. "First Term", "Quarterly", "Finals"
  startDate: Date;
  endDate: Date;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const examTermSchema = new Schema<IExamTerm>(
  {
    ...(baseFields as any),
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  baseSchemaOptions
);

// Ensure term name is unique within a school's academic year
examTermSchema.index({ schoolId: 1, academicYearId: 1, name: 1 }, { unique: true });

export const ExamTerm = model<IExamTerm>('ExamTerm', examTermSchema);
