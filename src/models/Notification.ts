import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface INotification extends Document {
  userId: Types.ObjectId;
  message: string;
  type: "payment_due" | "payment_received" | "general";
  isRead: boolean;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ["payment_due", "payment_received", "general"], default: "general" },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification: Model<INotification> =
  mongoose.models.Notification ??
  mongoose.model<INotification>("Notification", NotificationSchema);
export default Notification;
