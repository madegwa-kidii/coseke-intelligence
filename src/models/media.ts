import mongoose, { Document, Schema } from 'mongoose';

export interface IMedia extends Document {
  userId: string;
  publicId: string;
  url: string;
  secureUrl: string;
  resourceType: 'image' | 'video' | 'raw';
  format: string;
  width?: number;
  height?: number;
  duration?: number;
  bytes: number;
  folder: string;
  createdAt: Date;
  updatedAt: Date;
}

const mediaSchema = new Schema<IMedia>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    publicId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    url: {
      type: String,
      required: true,
    },
    secureUrl: {
      type: String,
      required: true,
    },
    resourceType: {
      type: String,
      enum: ['image', 'video', 'raw'],
      required: true,
    },
    format: {
      type: String,
      required: true,
    },
    width: Number,
    height: Number,
    duration: Number,
    bytes: {
      type: Number,
      required: true,
    },
    folder: {
      type: String,
      default: 'coseke',
      index: true,
    },
  },
  { timestamps: true }
);

export const Media = mongoose.models.Media || mongoose.model<IMedia>('Media', mediaSchema);
