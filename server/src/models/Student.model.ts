import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export const BloodGroup = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'] as const;
export type BloodGroupType = typeof BloodGroup[number];

export const Gender = { MALE: 'MALE', FEMALE: 'FEMALE', OTHER: 'OTHER' } as const;
export type GenderType = typeof Gender[keyof typeof Gender];

export const StudentStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  TRANSFERRED: 'TRANSFERRED',
  GRADUATED: 'GRADUATED',
  DROPPED: 'DROPPED',
} as const;
export type StudentStatusType = typeof StudentStatus[keyof typeof StudentStatus];

export interface IStudent extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  userId: Types.ObjectId;          // Linked User account
  
  // Academic Placement
  academicYearId: Types.ObjectId;
  classId: Types.ObjectId;         // References ClassSection
  rollNumber: number;              // Class-scope roll number
  admissionNumber: string;         // GLOBALLY unique ID
  admissionDate: Date;
  
  // Personal Info
  dateOfBirth: Date;
  gender: GenderType;
  bloodGroup: BloodGroupType;
  religion?: string;
  caste?: string;
  nationality: string;
  motherTongue?: string;
  
  // Contact
  currentAddress: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  permanentAddress?: {
    line1: string;
    city: string;
    state: string;
    pincode: string;
  };
  
  // Guardian Info
  guardians: Array<{
    relationship: string;
    name: string;
    phone: string;
    email?: string;
    occupation?: string;
    annualIncome?: number;          // In paise
    isEmergencyContact: boolean;
    userId?: Types.ObjectId;
  }>;
  
  status: StudentStatusType;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const studentSchema = new Schema<IStudent>(
  {
    ...(baseFields as any),
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    rollNumber: { type: Number, required: true },
    admissionNumber: { 
      type: String, 
      required: true, 
      unique: true, // Platform-wide uniqueness requested by user
      uppercase: true,
      trim: true,
    },
    admissionDate: { type: Date, default: Date.now },
    dateOfBirth: { type: Date, required: true },
    gender: { type: String, enum: Object.values(Gender), required: true },
    bloodGroup: { type: String, enum: BloodGroup, default: 'Unknown' },
    religion: String,
    caste: String,
    nationality: { type: String, default: 'Indian' },
    motherTongue: String,
    currentAddress: {
      line1: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    permanentAddress: {
      line1: String,
      city: String,
      state: String,
      pincode: String,
    },
    guardians: [{
      relationship: { type: String, required: true },
      name: { type: String, required: true },
      phone: { type: String, required: true },
      email: String,
      occupation: String,
      annualIncome: Number,
      isEmergencyContact: { type: Boolean, default: false },
      userId: { type: Schema.Types.ObjectId, ref: 'User' },
    }],
    status: { 
      type: String, 
      enum: Object.values(StudentStatus), 
      default: StudentStatus.ACTIVE,
    },
  },
  baseSchemaOptions
);

// High-frequency indexes
studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });
studentSchema.index({ schoolId: 1, classId: 1, rollNumber: 1 });
studentSchema.index({ schoolId: 1, status: 1 });

export const Student = model<IStudent>('Student', studentSchema);
