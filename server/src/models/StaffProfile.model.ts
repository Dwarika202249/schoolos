import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export const StaffDesignation = {
  PRINCIPAL: 'PRINCIPAL',
  VICE_PRINCIPAL: 'VICE_PRINCIPAL',
  HEAD_OF_DEPARTMENT: 'HEAD_OF_DEPARTMENT',
  SENIOR_TEACHER: 'SENIOR_TEACHER',
  TEACHER: 'TEACHER',
  ASSISTANT_TEACHER: 'ASSISTANT_TEACHER',
  LAB_ASSISTANT: 'LAB_ASSISTANT',
  LIBRARIAN: 'LIBRARIAN',
  ACCOUNTANT: 'ACCOUNTANT',
  CLERK: 'CLERK',
  PEON: 'PEON',
  SECURITY: 'SECURITY',
  DRIVER: 'DRIVER',
  OTHER: 'OTHER',
} as const;
export type StaffDesignationType = typeof StaffDesignation[keyof typeof StaffDesignation];

export const EmploymentType = {
  FULL_TIME: 'FULL_TIME',
  PART_TIME: 'PART_TIME',
  CONTRACT: 'CONTRACT',
  GUEST: 'GUEST',
} as const;
export type EmploymentTypeType = typeof EmploymentType[keyof typeof EmploymentType];

export interface IStaffProfile extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  userId: Types.ObjectId;
  
  employeeId: string;
  designation: StaffDesignationType;
  department?: string;
  employmentType: EmploymentTypeType;
  joiningDate: Date;
  probationEndDate?: Date;
  relievingDate?: Date;
  
  qualifications: Array<{
    degree: string;
    field: string;
    institution: string;
    year: number;
  }>;
  
  emergencyContact: {
    name: string;
    relation: string;
    phone: string;
  };
  
  bankDetails: {
    bankName: string;
    accountNumber: string;
    ifscCode: string;
    accountHolderName: string;
  };
  
  aadhaarNumber?: string;
  panNumber?: string;
  
  isActive: boolean;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const staffProfileSchema = new Schema<IStaffProfile>(
  {
    ...baseFields,
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    employeeId: { type: String, required: true },
    designation: { type: String, enum: Object.values(StaffDesignation), required: true },
    department: String,
    employmentType: { type: String, enum: Object.values(EmploymentType), required: true },
    joiningDate: { type: Date, required: true },
    probationEndDate: Date,
    relievingDate: Date,
    
    qualifications: [{
      degree: { type: String },
      field: { type: String },
      institution: { type: String },
      year: { type: Number },
    }],
    
    emergencyContact: {
      name: { type: String },
      relation: { type: String },
      phone: { type: String },
    },
    
    bankDetails: {
      bankName: { type: String },
      accountNumber: { type: String },
      ifscCode: { type: String, uppercase: true },
      accountHolderName: { type: String },
    },
    
    aadhaarNumber: String,
    panNumber: String,
    
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

staffProfileSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
staffProfileSchema.index({ schoolId: 1, branchId: 1, designation: 1, isActive: 1 });

export const StaffProfile = model<IStaffProfile>('StaffProfile', staffProfileSchema);
