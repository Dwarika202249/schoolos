import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IClassSection extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  grade: string;             // e.g., "9", "10", "KG1"
  section: string;           // e.g., "A", "B", "C"
  displayName: string;       // e.g., "Class 9 - A" (auto-computed)
  classTeacherId?: Types.ObjectId;
  maxStrength: number;       // Maximum student capacity
  subjectIds: Types.ObjectId[];
  isActive: boolean;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const classSectionSchema = new Schema<IClassSection>(
  {
    ...(baseFields as any),
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    grade: { type: String, required: true, trim: true },
    section: { type: String, required: true, trim: true, uppercase: true },
    displayName: { type: String, trim: true },
    classTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    maxStrength: { type: Number, default: 60 },
    subjectIds: [{ type: Schema.Types.ObjectId, ref: 'Subject' }],
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

classSectionSchema.pre<IClassSection>('save', function(next) {
  this.displayName = `Class ${this.grade} - ${this.section}`;
  next();
});

classSectionSchema.index(
  { schoolId: 1, branchId: 1, academicYearId: 1, grade: 1, section: 1 }, 
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const ClassSection = model<IClassSection>('ClassSection', classSectionSchema);
