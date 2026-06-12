import mongoose from "mongoose";

async function main() {
  await mongoose.connect(process.env.MONGODB_URI!);
  const result = await mongoose.connection.collection("users").updateOne(
    { username: "admin" },
    { $set: { mustChangePassword: false, role: "admin" } }
  );
  console.log("Updated:", result.modifiedCount);
  const u = await mongoose.connection.collection("users").findOne({ username: "admin" });
  console.log("Admin:", { role: u?.role, mustChangePassword: u?.mustChangePassword });
  process.exit(0);
}

main().catch(e => { console.error(e); process.exit(1); });
