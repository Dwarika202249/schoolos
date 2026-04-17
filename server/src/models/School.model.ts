import { Schema, model, Document, Types } from 'mongoose';
import { baseSchemaOptions } from './base/baseSchema';

export const SchoolStatus = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  TRIAL: 'TRIAL',
} as const;
export type SchoolStatusType = typeof SchoolStatus[keyof typeof SchoolStatus];

export const SubscriptionPlan = {
  FREE_PILOT: 'FREE_PILOT',
  STARTER: 'STARTER',
  GROWTH: 'GROWTH',
  ENTERPRISE: 'ENTERPRISE',
} as const;
export type SubscriptionPlanType = typeof SubscriptionPlan[keyof typeof SubscriptionPlan];

export interface ISchool extends Document {
  name: string;
  slug: string;
  code: string;
  address: {
    line1: string;
    line2?: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  phone: string;
  email: string;
  website?: string;
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  boardAffiliation: string;
  mediumOfInstruction: string;
  academicYearStartMonth: number;
  status: SchoolStatusType;
  plan: SubscriptionPlanType;
  trialEndsAt?: Date;
  maxBranches: number;
  maxStudents: number;
  ownerUserId: Types.ObjectId;
  registrationNumber?: string;
  affiliationNumber?: string;
  isDeleted: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const schoolSchema = new Schema<ISchool>(
  {
    name: { type: String, required: true, trim: true, maxlength: 200 },
    slug: { 
      type: String, 
      required: true, 
      unique: true, 
      lowercase: true,
      match: /^[a-z0-9-]+$/,
    },
    code: { type: String, required: true, unique: true, uppercase: true },
    address: {
      line1: { type: String, required: true },
      line2: String,
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true, match: /^\d{6}$/ },
      country: { type: String, default: 'India' },
    },
    phone: { type: String, required: true, match: /^\+?[0-9]{10,15}$/ },
    email: { type: String, required: true, lowercase: true, match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/ },
    website: String,
    branding: {
      logoUrl: String,
      primaryColor: { type: String, default: '#2563EB', match: /^#[0-9A-Fa-f]{6}$/ },
      secondaryColor: { type: String, default: '#1E40AF', match: /^#[0-9A-Fa-f]{6}$/ },
    },
    boardAffiliation: { type: String, required: true, trim: true },
    mediumOfInstruction: { type: String, default: 'English' },
    academicYearStartMonth: { type: Number, default: 4, min: 1, max: 12 },
    status: { 
      type: String, 
      enum: Object.values(SchoolStatus), 
      default: SchoolStatus.TRIAL,
    },
    plan: { 
      type: String, 
      enum: Object.values(SubscriptionPlan), 
      default: SubscriptionPlan.FREE_PILOT,
    },
    trialEndsAt: Date,
    maxBranches: { type: Number, default: 3 },
    maxStudents: { type: Number, default: 500 },
    ownerUserId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    registrationNumber: String,
    affiliationNumber: String,
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
  },
  baseSchemaOptions
);

schoolSchema.index({ status: 1, isDeleted: 1 });

export const School = model<ISchool>('School', schoolSchema);
