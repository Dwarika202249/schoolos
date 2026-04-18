import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export enum SubjectType {
  CORE = 'CORE',
  ELECTIVE = 'ELECTIVE',
  VOCATIONAL = 'VOCATIONAL',
  LANGUAGE = 'LANGUAGE'
}

export interface ISubject extends Document {
  schoolId: Types.ObjectId;
  name: string;
  code?: string; // e.g. "PHY-101"
  type: SubjectType;
  department?: string;
  isActive: boolean;
  isDeleted: boolean;
  createdBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const subjectSchema = new Schema<ISubject>(
  {
    ...(baseFields as any),
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true },
    type: { 
      type: String, 
      enum: Object.values(SubjectType), 
      default: SubjectType.CORE 
    },
    department: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  baseSchemaOptions
);

// Unique subject name per school (Active subjects only)
subjectSchema.index(
  { schoolId: 1, name: 1 }, 
  { unique: true, partialFilterExpression: { isDeleted: false } }
);

export const Subject = model<ISubject>('Subject', subjectSchema);
