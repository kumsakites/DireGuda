import { auth } from "@/auth";
import { redirect } from "next/navigation";
import LoginClient from "./login-client";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) {
    redirect(session.user.mustChangePassword ? "/change-password" : "/dashboard");
  }
  return <LoginClient />;
}
