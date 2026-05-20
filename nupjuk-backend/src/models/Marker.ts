import mongoose, { Document, Schema } from "mongoose";

export type MarkerCategory =
  | "building"
  | "facility"
  | "dining"
  | "bus"
  | "event"
  | "cafe"
  | "library"
  | "etc";

export type MarkerStatus = "active" | "inactive";
export type DynamicType = "none" | "dining" | "bus" | "event";

export interface IMarker extends Document {
  titleKo: string;
  titleEn?: string;
  parentId?: mongoose.Types.ObjectId | null;
  latitude: number;
  longitude: number;
  category: MarkerCategory;
  markdownKo: string;
  markdownEn?: string;
  imageUrl?: string;
  createdBy: mongoose.Types.ObjectId;
  activeFrom?: Date;
  activeUntil?: Date;
  status: MarkerStatus;
  dynamicType: DynamicType;
  externalUrl?: string;
  createdAt: Date;
  updatedAt: Date;
}

const markerSchema = new Schema<IMarker>(
  {
    titleKo: { type: String, required: true, trim: true },
    titleEn: { type: String, trim: true },
    parentId: {
      type: Schema.Types.ObjectId,
      ref: "Marker",
      default: null,
    },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    category: {
      type: String,
      enum: ["building", "facility", "dining", "bus", "event", "cafe", "library", "etc"],
      required: true,
    },
    markdownKo: { type: String, required: true },
    markdownEn: { type: String },
    imageUrl: { type: String },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Manager",
      required: true,
    },
    activeFrom: { type: Date },
    activeUntil: { type: Date },
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
    dynamicType: {
      type: String,
      enum: ["none", "dining", "bus", "event"],
      default: "none",
    },
    externalUrl: { type: String },
  },
  { timestamps: true }
);

// 인덱스: 자주 필터링되는 필드
markerSchema.index({ category: 1 });
markerSchema.index({ status: 1 });
markerSchema.index({ parentId: 1 });
markerSchema.index({ createdBy: 1 });

export const Marker = mongoose.model<IMarker>("Marker", markerSchema);
