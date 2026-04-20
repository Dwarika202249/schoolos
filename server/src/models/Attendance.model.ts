import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export const AttendanceStatus = ['PRESENT', 'ABSENT', 'LATE', 'EXCUSED'] as const;
export type AttendanceStatusType = typeof AttendanceStatus[number];

export interface IAttendance extends Document {
  schoolId: Types.ObjectId;
  classId: Types.ObjectId;
  academicYearId: Types.ObjectId;
  date: Date;
  markedBy: Types.ObjectId;
  records: Array<{
    studentId: Types.ObjectId;
    status: AttendanceStatusType;
    comment?: string;
  }>;
  summary: {
    present: number;
    absent: number;
    late: number;
  };
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const attendanceSchema = new Schema<IAttendance>(
  {
    ...(baseFields as any),
    classId: { type: Schema.Types.ObjectId, ref: 'ClassSection', required: true },
    academicYearId: { type: Schema.Types.ObjectId, ref: 'AcademicYear', required: true },
    date: { 
      type: Date, 
      required: true,
      set: (v: any) => {
        // Force date to start of day for unique indexing stability
        const d = new Date(v);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      }
    },
    markedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    records: [{
      studentId: { type: Schema.Types.ObjectId, ref: 'Student', required: true },
      status: { type: String, enum: AttendanceStatus, required: true },
      comment: String
    }],
    summary: {
      present: { type: Number, default: 0 },
      absent: { type: Number, default: 0 },
      late: { type: Number, default: 0 }
    }
  },
  baseSchemaOptions
);

// Compound index to prevent duplicate attendance entry for same class on same day
attendanceSchema.index({ schoolId: 1, classId: 1, date: 1 }, { unique: true });

// Index for reporting
attendanceSchema.index({ schoolId: 1, date: 1 });

export const Attendance = model<IAttendance>('Attendance', attendanceSchema);
