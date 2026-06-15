import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
  username: string;
  email?: string;
  phone?: string;
  passwordHash: string;
  role: "admin" | "user";
  languagePreference: "om" | "en";
  mustChangePassword: boolean;
  isActive: boolean;
  avatar?: string;
  resetToken?: string;
  resetTokenExpiry?: Date;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, sparse: true, unique: true },
    phone: { type: String, sparse: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ["admin", "user"], default: "user" },
    languagePreference: { type: String, enum: ["om", "en"], default: "en" },
    mustChangePassword: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    avatar: { type: String },
    resetToken: { type: String },
    resetTokenExpiry: { type: Date },
  },
  { timestamps: true }
);

const User: Model<IUser> = mongoose.models.User ?? mongoose.model<IUser>("User", UserSchema);
export default User;
