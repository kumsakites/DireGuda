import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ProfileClient from "./profile-client";

export default async function ProfilePage() {
  const session = await auth();
  let user = null;
  try {
    await connectDB();
    user = await User.findById(session?.user.id, "-passwordHash").lean();
  } catch { /* DB unavailable */ }

  return (
    <div className="p-6 max-w-md space-y-6">
      <h1 className="text-2xl font-bold">Profile</h1>
      <ProfileClient user={JSON.parse(JSON.stringify(user ?? {
        username: session?.user.name,
        email: session?.user.email,
        avatar: null,
      }))} />
    </div>
  );
}
