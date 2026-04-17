import { Schema, model, Document, Types } from 'mongoose';
import bcrypt from 'bcryptjs';
import { baseSchemaOptions } from './base/baseSchema';

export const UserRole = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  OWNER: 'OWNER',
  ADMIN: 'ADMIN',
  TEACHER: 'TEACHER',
  STAFF: 'STAFF',
  STUDENT: 'STUDENT',
  PARENT: 'PARENT',
} as const;
export type UserRoleType = typeof UserRole[keyof typeof UserRole];

export interface IUser extends Document {
  schoolId?: Types.ObjectId;
  branchId?: Types.ObjectId;
  email: string;
  phone?: string;
  passwordHash: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role: UserRoleType;
  customPermissions?: string[];
  studentProfileId?: Types.ObjectId;
  staffProfileId?: Types.ObjectId;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  lastLoginAt?: Date;
  failedLoginAttempts: number;
  lockoutUntil?: Date;
  passwordResetToken?: string;
  passwordResetExpiry?: Date;
  isActive: boolean;
  isDeleted: boolean;
  deletedAt?: Date;
  createdBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(plainPassword: string): Promise<boolean>;
  toSafeObject(): Omit<IUser, 'passwordHash' | 'passwordResetToken'>;
}

const userSchema = new Schema<IUser>(
  {
    schoolId: { 
      type: Schema.Types.ObjectId, 
      ref: 'School',
      required: function(this: IUser) {
        return this.role !== UserRole.SUPER_ADMIN;
      },
      index: true,
    },
    branchId: { type: Schema.Types.ObjectId, ref: 'Branch' },
    email: { 
      type: String, 
      required: true, 
      lowercase: true, 
      trim: true,
    },
    phone: { type: String, sparse: true },
    passwordHash: { type: String, required: true, select: false },
    firstName: { type: String, required: true, trim: true, maxlength: 100 },
    lastName: { type: String, required: true, trim: true, maxlength: 100 },
    displayName: { type: String, trim: true },
    avatarUrl: String,
    role: { 
      type: String, 
      enum: Object.values(UserRole), 
      required: true,
      index: true,
    },
    customPermissions: [String],
    studentProfileId: { type: Schema.Types.ObjectId, ref: 'Student' },
    staffProfileId: { type: Schema.Types.ObjectId, ref: 'StaffProfile' },
    isEmailVerified: { type: Boolean, default: false },
    isPhoneVerified: { type: Boolean, default: false },
    lastLoginAt: Date,
    failedLoginAttempts: { type: Number, default: 0 },
    lockoutUntil: Date,
    passwordResetToken: { type: String, select: false },
    passwordResetExpiry: { type: Date, select: false },
    isActive: { type: Boolean, default: true },
    isDeleted: { type: Boolean, default: false },
    deletedAt: Date,
    createdBy: { type: Schema.Types.ObjectId, ref: 'User' },
  },
  baseSchemaOptions
);

userSchema.index({ schoolId: 1, email: 1 }, { unique: true });

userSchema.pre<IUser>('save', async function(next) {
  this.displayName = `${this.firstName} ${this.lastName}`;
  if (this.isModified('passwordHash')) {
    this.passwordHash = await bcrypt.hash(this.passwordHash, 12);
  }
  next();
});

userSchema.methods.comparePassword = async function(
  plainPassword: string
): Promise<boolean> {
  return bcrypt.compare(plainPassword, this.passwordHash);
};

userSchema.methods.toSafeObject = function() {
  const obj = this.toObject();
  delete obj.passwordHash;
  delete obj.passwordResetToken;
  delete obj.passwordResetExpiry;
  return obj;
};

export const User = model<IUser>('User', userSchema);
