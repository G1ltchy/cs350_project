import mongoose, { Document, Schema } from "mongoose";

export type ResetRequestStatus = "pending" | "resolved";

export interface IPasswordResetRequest extends Document {
  managerId: mongoose.Types.ObjectId;
  message?: string;
  status: ResetRequestStatus;
  createdAt: Date;
  updatedAt: Date;
}

const passwordResetRequestSchema = new Schema<IPasswordResetRequest>(
  {
    managerId: {
      type: Schema.Types.ObjectId,
      ref: "Manager",
      required: true,
    },
    message: { type: String },
    status: {
      type: String,
      enum: ["pending", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

export const PasswordResetRequest = mongoose.model<IPasswordResetRequest>(
  "PasswordResetRequest",
  passwordResetRequestSchema
);
