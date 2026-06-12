import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await mongoose.connection.collection("users").findOne({ username: "admin" });
  console.log("User found:", !!user);
  console.log("Fields:", Object.keys(user ?? {}));
  const valid = await bcrypt.compare("Admin@123", user?.passwordHash);
  console.log("Password valid:", valid);
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
