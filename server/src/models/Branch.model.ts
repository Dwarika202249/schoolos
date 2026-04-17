import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface IBranch extends Document {
  schoolId: Types.ObjectId;
  name: string;
  code: string;                // e.g., "NORTH-CAMPUS"
  address: {
    line1: string;
    city: string;
    district?: string;
    state: string;
    pincode: string;
  };
  phone?: string;
  email?: string;
  principalId?: Types.ObjectId;  // References User with ADMIN/PRINCIPAL role
  isHeadquarters: boolean;        // One branch marked as HQ per school
  isActive: boolean;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const branchSchema = new Schema<IBranch>(
  {
    ...(baseFields as any),
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, uppercase: true },
    address: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      district: String,
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    phone: String,
    email: String,
    principalId: { type: Schema.Types.ObjectId, ref: 'User' },
    isHeadquarters: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

branchSchema.index({ schoolId: 1, code: 1 }, { unique: true });
branchSchema.index({ schoolId: 1, isActive: 1, isDeleted: 1 });

export const Branch = model<IBranch>('Branch', branchSchema);
