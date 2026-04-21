import { Schema, model, Document, Types } from 'mongoose';
import { baseFields, baseSchemaOptions } from './base/baseSchema';

export const StaffAttendanceStatus = ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY', 'ON_LEAVE'] as const;
export type StaffAttendanceStatusType = typeof StaffAttendanceStatus[number];

export interface IStaffAttendance extends Document {
  schoolId: Types.ObjectId;
  branchId: Types.ObjectId;
  userId: Types.ObjectId; // Reference to the User (Staff)
  date: Date;
  status: StaffAttendanceStatusType;
  checkIn?: string; // HH:mm
  checkOut?: string; // HH:mm
  note?: string;
  isDeleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const staffAttendanceSchema = new Schema<IStaffAttendance>(
  {
    ...(baseFields as any),
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch', required: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { 
      type: Date, 
      required: true,
      set: (v: any) => {
        const d = new Date(v);
        d.setUTCHours(0, 0, 0, 0);
        return d;
      }
    },
    status: { type: String, enum: StaffAttendanceStatus, required: true },
    checkIn: String,
    checkOut: String,
    note: String,
  },
  baseSchemaOptions
);

// One record per staff per day
staffAttendanceSchema.index({ schoolId: 1, userId: 1, date: 1 }, { unique: true });
staffAttendanceSchema.index({ schoolId: 1, date: 1, status: 1 });

export const StaffAttendance = model<IStaffAttendance>('StaffAttendance', staffAttendanceSchema);
