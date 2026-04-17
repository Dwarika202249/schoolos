import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export interface ISalaryConfig extends Document {
  schoolId: Types.ObjectId;
  staffId: Types.ObjectId;       // References StaffProfile
  
  basicSalary: number;           // In Paise
  allowances: Array<{
    name: string;
    amount: number;
  }>;
  deductions: Array<{
    name: string;
    amount: number;
  }>;
  
  netSalary: number;             // Calculated field: basic + allowances - deductions
  effectiveFrom: Date;
  
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const salaryConfigSchema = new Schema<ISalaryConfig>(
  {
    ...(baseFields as any),
    staffId: { type: Schema.Types.ObjectId, ref: 'StaffProfile', required: true, unique: true },
    
    basicSalary: { type: Number, required: true },
    allowances: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true }
    }],
    deductions: [{
      name: { type: String, required: true },
      amount: { type: Number, required: true }
    }],
    
    netSalary: { type: Number, required: true },
    effectiveFrom: { type: Date, default: Date.now }
  },
  baseSchemaOptions
);

export const SalaryConfig = model<ISalaryConfig>('SalaryConfig', salaryConfigSchema);
