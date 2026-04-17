import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export const PaymentMethod = {
  CASH: 'CASH',
  BANK_TRANSFER: 'BANK_TRANSFER',
  UPI: 'UPI',
  CHEQUE: 'CHEQUE',
  ONLINE: 'ONLINE'
} as const;

export interface ITransaction extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  invoiceId?: Types.ObjectId;     // Optional if payment is linked to a specific invoice
  studentId?: Types.ObjectId;     // For fee collection
  staffId?: Types.ObjectId;       // For salary payout
  
  type: 'INCOME' | 'EXPENSE';
  category: 'FEE_COLLECTION' | 'SALARY_PAYOUT' | 'MAINTENANCE' | 'OTHER';
  
  amount: number;                // In Paise
  paymentMethod: typeof PaymentMethod[keyof typeof PaymentMethod];
  referenceId?: string;          // Transaction ID, Cheque Number, etc.
  notes?: string;
  transactionDate: Date;
  
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const transactionSchema = new Schema<ITransaction>(
  {
    ...(baseFields as any),
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    invoiceId: { type: Schema.Types.ObjectId, ref: 'Invoice' },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student' },
    staffId: { type: Schema.Types.ObjectId, ref: 'StaffProfile' },
    
    type: { type: String, enum: ['INCOME', 'EXPENSE'], required: true },
    category: { 
      type: String, 
      enum: ['FEE_COLLECTION', 'SALARY_PAYOUT', 'MAINTENANCE', 'OTHER'], 
      required: true 
    },
    
    amount: { type: Number, required: true },
    paymentMethod: { type: String, enum: Object.values(PaymentMethod), required: true },
    referenceId: String,
    notes: String,
    transactionDate: { type: Date, default: Date.now }
  },
  baseSchemaOptions
);

transactionSchema.index({ schoolId: 1, transactionDate: -1 });
transactionSchema.index({ invoiceId: 1 });

export const Transaction = model<ITransaction>('Transaction', transactionSchema);
