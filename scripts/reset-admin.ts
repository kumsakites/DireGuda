import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const hash = await bcrypt.hash("Admin@123", 12);
  const result = await mongoose.connection.collection("users").updateOne(
    { username: "admin" },
    { $set: { passwordHash: hash, mustChangePassword: false, role: "admin" } }
  );
  console.log("Reset admin password. Modified:", result.modifiedCount);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
