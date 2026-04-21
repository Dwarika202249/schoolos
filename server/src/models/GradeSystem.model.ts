import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IGradeSystem extends Document {
  schoolId: Types.ObjectId;
  label: string;      // e.g. "A1", "B2", "Distinction"
  minPercent: number; // 91
  maxPercent: number; // 100
  points?: number;    // e.g. 10.0 for GPA
  isSystem?: boolean; // Default standard grades
  isDeleted: boolean;
}

const gradeSystemSchema = new Schema<IGradeSystem>(
  {
    ...(baseFields as any),
    label: { type: String, required: true, trim: true },
    minPercent: { type: Number, required: true },
    maxPercent: { type: Number, required: true },
    points: { type: Number },
    isSystem: { type: Boolean, default: false },
  },
  baseSchemaOptions
);

// Unique grade per school within a range
gradeSystemSchema.index({ schoolId: 1, label: 1 }, { unique: true });

export const GradeSystem = model<IGradeSystem>('GradeSystem', gradeSystemSchema);
