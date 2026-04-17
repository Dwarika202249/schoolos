import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export const PayrollStatus = {
  DRAFT: 'DRAFT',
  PROCESSED: 'PROCESSED',
  PAID: 'PAID',
  VOID: 'VOID'
} as const;

export interface IPayroll extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  staffId: Types.ObjectId;
  
  month: number;               // 1-12
  year: number;
  
  basicSalary: number;
  totalAllowances: number;
  totalDuctions: number;
  netSalary: number;
  
  status: typeof PayrollStatus[keyof typeof PayrollStatus];
  paymentDate?: Date;
  transactionId?: Types.ObjectId; // References Transaction model
  
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const payrollSchema = new Schema<IPayroll>(
  {
    ...(baseFields as any),
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    staffId: { type: Schema.Types.ObjectId, ref: 'StaffProfile', required: true },
    
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    
    basicSalary: { type: Number, required: true },
    totalAllowances: { type: Number, default: 0 },
    totalDuctions: { type: Number, default: 0 },
    netSalary: { type: Number, required: true },
    
    status: { 
      type: String, 
      enum: Object.values(PayrollStatus), 
      default: 'DRAFT' 
    },
    paymentDate: Date,
    transactionId: { type: Schema.Types.ObjectId, ref: 'Transaction' }
  },
  baseSchemaOptions
);

payrollSchema.index({ schoolId: 1, staffId: 1, month: 1, year: 1 }, { unique: true });

export const Payroll = model<IPayroll>('Payroll', payrollSchema);
