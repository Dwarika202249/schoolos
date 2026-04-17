import { Schema, SchemaOptions } from 'mongoose';

/**
 * Reusable base fields applied to all tenant-scoped models.
 */
export const baseFields = {
  schoolId: {
    type: Schema.Types.ObjectId,
    ref: 'School',
    required: [true, 'schoolId is required for tenant isolation'],
    index: true,
  },
  createdBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  isDeleted: {
    type: Boolean,
    default: false,
    index: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
  deletedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    default: null,
  },
};

/**
 * Standard schema options applied to all models.
 */
export const baseSchemaOptions: any = {
  timestamps: true,
  versionKey: false,
  toJSON: {
    virtuals: true,
    transform: (_doc: any, ret: any) => {
      ret.id = ret._id.toString();
      delete ret._id;
      return ret;
    },
  },
  toObject: { virtuals: true },
};
