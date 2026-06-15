import mongoose, { Schema, Document, Model, Types } from "mongoose";

export interface IPayment extends Document {
  userId: Types.ObjectId;
  amount: number;
  status: "pending" | "paid" | "overdue" | "submitted";
  datePaid?: Date;
  paymentMonth: string; // "2026-06"
  referenceNumber?: string;
  nextPaymentDate?: Date;
  screenshotUrl?: string;
  userSubmitted: boolean;
  note?: string;
  createdAt: Date;
}

const PaymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true },
    status: { type: String, enum: ["pending", "paid", "overdue", "submitted"], default: "pending" },
    datePaid: { type: Date },
    paymentMonth: { type: String, required: true },
    referenceNumber: { type: String },
    nextPaymentDate: { type: Date },
    screenshotUrl: { type: String },
    userSubmitted: { type: Boolean, default: false },
    note: { type: String },
  },
  { timestamps: true }
);

const Payment: Model<IPayment> =
  mongoose.models.Payment ?? mongoose.model<IPayment>("Payment", PaymentSchema);
export default Payment;
