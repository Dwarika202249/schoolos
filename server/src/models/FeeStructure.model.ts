import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IFeeStructure extends Document {
  schoolId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  classId: Types.ObjectId;       // References ClassSection
  categoryId: Types.ObjectId;    // References FeeCategory
  amount: number;                // In Paise (e.g., 500000 for ₹5000)
  frequency: 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'ONE_TIME';
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    ...(baseFields as any),
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    categoryId: { type: Schema.Types.ObjectId, ref: 'FeeCategory', required: true },
    amount: { type: Number, required: true }, // Store in paise
    frequency: { 
      type: String, 
      enum: ['MONTHLY', 'QUARTERLY', 'YEARLY', 'ONE_TIME'], 
      default: 'MONTHLY' 
    },
  },
  baseSchemaOptions
);

// Prevent duplicate fee categories for the same class in the same year
feeStructureSchema.index({ academicYearId: 1, classId: 1, categoryId: 1 }, { unique: true });

export const FeeStructure = model<IFeeStructure>('FeeStructure', feeStructureSchema);
