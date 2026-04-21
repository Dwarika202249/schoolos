import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

/**
 * MASTER TIMETABLE
 * Stores the recurring weekly schedule.
 */
export interface ITimetable extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  classId: Types.ObjectId;
  
  dayOfWeek: number; // 1 (Mon) - 6 (Sat)
  periodNumber: number; // 1-8
  
  subjectId: Types.ObjectId;
  teacherId: Types.ObjectId; // User ID of the staff member
  
  startTime?: string; // e.g. "07:15"
  endTime?: string;   // e.g. "08:00"
  roomNumber?: string;
  
  isDeleted: boolean;
}

const timetableSchema = new Schema<ITimetable>(
  {
    ...(baseFields as any),
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    
    dayOfWeek: { type: Number, required: true, min: 1, max: 7 },
    periodNumber: { type: Number, required: true },
    
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    teacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    startTime: String,
    endTime: String,
    roomNumber: String,
  },
  baseSchemaOptions
);

// Prevent duplicate assignment: One class can't have two subjects in same period/day
timetableSchema.index({ schoolId: 1, academicYearId: 1, classId: 1, dayOfWeek: 1, periodNumber: 1 }, { unique: true });

// Prevent duplicate assignment: One teacher can't be in two places in same period/day
timetableSchema.index({ schoolId: 1, academicYearId: 1, teacherId: 1, dayOfWeek: 1, periodNumber: 1 }, { unique: true });

export const Timetable = model<ITimetable>('Timetable', timetableSchema);


/**
 * SUBSTITUTION LEDGER
 * Stores daily ad-hoc changes (proxies/adjustments).
 */
export interface ISubstitution extends Document {
  schoolId: Types.ObjectId;
  date: Date;
  periodNumber: number;
  classId: Types.ObjectId;
  
  originalTeacherId?: Types.ObjectId; // The teacher who was scheduled in Master Timetable
  substituteTeacherId: Types.ObjectId; // The teacher assigned for today
  
  subjectId: Types.ObjectId;
  note?: string;
  isDeleted: boolean;
}

const substitutionSchema = new Schema<ISubstitution>(
  {
    ...(baseFields as any),
    date: { 
      type: Date, 
      required: true,
      set: (v: any) => {
        const d = new Date(v);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      }
    },
    periodNumber: { type: Number, required: true },
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    
    originalTeacherId: { type: Schema.Types.ObjectId, ref: 'User' },
    substituteTeacherId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    
    subjectId: { type: Schema.Types.ObjectId, ref: 'Subject', required: true },
    note: String,
  },
  baseSchemaOptions
);

// One substitution per class/period/date
substitutionSchema.index({ schoolId: 1, date: 1, classId: 1, periodNumber: 1 }, { unique: true });

export const Substitution = model<ISubstitution>('Substitution', substitutionSchema);
