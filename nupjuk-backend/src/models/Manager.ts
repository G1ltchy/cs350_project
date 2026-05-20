import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcrypt";

export type ManagerStatus = "pending" | "approved" | "rejected";
export type ManagerRole = "manager" | "admin";

export interface IManager extends Document {
  username: string;
  email: string;
  passwordHash: string;
  status: ManagerStatus;
  role: ManagerRole;
  message?: string;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<boolean>;
}

const managerSchema = new Schema<IManager>(
  {
    username: { type: String, required: true, unique: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true },
    passwordHash: { type: String, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    role: {
      type: String,
      enum: ["manager", "admin"],
      default: "manager",
    },
    message: { type: String },
  },
  { timestamps: true }
);

managerSchema.methods.comparePassword = async function (
  password: string
): Promise<boolean> {
  const pepper = process.env.PASSWORD_PEPPER ?? "";
  return bcrypt.compare(pepper + password, this.passwordHash);
};

export const Manager = mongoose.model<IManager>("Manager", managerSchema);
