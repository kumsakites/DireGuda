import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const MONGODB_URI = process.env.MONGODB_URI!;

const UserSchema = new mongoose.Schema({
  username: String,
  email: String,
  passwordHash: String,
  role: String,
  languagePreference: { type: String, default: "en" },
  mustChangePassword: { type: Boolean, default: false },
}, { timestamps: true });

const User = mongoose.models.User ?? mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  const existing = await User.findOne({ username: "admin" });
  if (existing) {
    console.log("Admin user already exists");
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash("Admin@123", 12);
  await User.create({ username: "admin", role: "admin", passwordHash, mustChangePassword: false });
  console.log("Created admin user — username: admin, password: Admin@123");
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
