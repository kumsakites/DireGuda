import mongoose from "mongoose";
import bcrypt from "bcryptjs";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const user = await mongoose.connection.collection("users").findOne({ username: "testuser2" });
  console.log("Found:", !!user, "mustChangePassword:", user?.mustChangePassword);
  const tests = ["Test@1234", "testuser2"];
  for (const p of tests) {
    const valid = await bcrypt.compare(p, user?.passwordHash);
    console.log(`"${p}" matches:`, valid);
  }
  process.exit(0);
}
main().catch(e => { console.error(e); process.exit(1); });
