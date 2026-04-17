import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IFeeCategory extends Document {
  schoolId: Types.ObjectId;
  name: string;                // e.g., "Tuition Fee", "Bus Fee"
  description?: string;
  isMandatory: boolean;        // If true, applies to everyone in a class
  isActive: boolean;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const feeCategorySchema = new Schema<IFeeCategory>(
  {
    ...(baseFields as any),
    name: { type: String, required: true, trim: true },
    description: String,
    isMandatory: { type: Boolean, default: true },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

feeCategorySchema.index({ schoolId: 1, name: 1 }, { unique: true });

export const FeeCategory = model<IFeeCategory>('FeeCategory', feeCategorySchema);
