import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export const InvoiceStatus = {
  UNPAID: 'UNPAID',
  PARTIAL: 'PARTIAL',
  PAID: 'PAID',
  VOID: 'VOID'
} as const;

export interface IInvoice extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  studentId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  invoiceNumber: string;       // human readable e.g. INV-2024-0001
  
  items: Array<{
    categoryId: Types.ObjectId;
    name: string;
    amount: number;            // amount in paise
  }>;
  
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  
  status: typeof InvoiceStatus[keyof typeof InvoiceStatus];
  month?: number;              // 1-12 if monthly billing
  dueDate: Date;
  issuedDate: Date;
  
  isDeleted: boolean;
  createdBy: Types.ObjectId;
}

const invoiceSchema = new Schema<IInvoice>(
  {
    ...(baseFields as any),
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    invoiceNumber: { type: String, required: true },
    
    items: [{
      categoryId: { type: Schema.Types.ObjectId, ref: 'FeeCategory' },
      name: String,
      amount: Number
    }],
    
    totalAmount: { type: Number, required: true },
    paidAmount: { type: Number, default: 0 },
    dueAmount: { type: Number, required: true },
    
    status: { 
      type: String, 
      enum: Object.values(InvoiceStatus), 
      default: 'UNPAID' 
    },
    month: { type: Number, min: 1, max: 12 },
    dueDate: { type: Date, required: true },
    issuedDate: { type: Date, default: Date.now }
  },
  baseSchemaOptions
);

invoiceSchema.index({ schoolId: 1, invoiceNumber: 1 }, { unique: true });
invoiceSchema.index({ studentId: 1, status: 1 });

export const Invoice = model<IInvoice>('Invoice', invoiceSchema);
