import { Schema, model, Document, Types } from "mongoose";
import { baseFields, baseSchemaOptions } from "./base/baseSchema";

export interface IAcademicYear extends Document {
  schoolId: Types.ObjectId;
  name: string; // e.g., "2024-25"
  startDate: Date;
  endDate: Date;
  isCurrent: boolean; // Only one active per school
  isLocked: boolean; // Once locked, no grade/attendance edits allowed
  createdBy: Types.ObjectId;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const academicYearSchema = new Schema<IAcademicYear>(
  {
    ...(baseFields as any),
    name: { type: String, required: true, trim: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    isCurrent: { type: Boolean, default: false, index: true },
    isLocked: { type: Boolean, default: false },
  },
  baseSchemaOptions,
);

academicYearSchema.index({ schoolId: 1, name: 1 }, { unique: true });
academicYearSchema.index({ schoolId: 1, isCurrent: 1 });

export const AcademicYear = model<IAcademicYear>(
  "AcademicYear",
  academicYearSchema,
);
