import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import User from "@/models/User";
import ProfileClient from "./profile-client";
import PageHeader from "@/components/page-header";

export default async function ProfilePage() {
  const session = await auth();
  let user = null;
  try {
    await connectDB();
    user = await User.findById(session?.user.id, "-passwordHash").lean();
  } catch { /* DB unavailable */ }

  return (
    <div className="max-w-md space-y-6">
      <PageHeader title="Profile" description="Manage your account details and preferences" />
      <ProfileClient user={JSON.parse(JSON.stringify(user ?? {
        username: session?.user.name,
        email: session?.user.email,
        avatar: null,
      }))} />
    </div>
  );
}
