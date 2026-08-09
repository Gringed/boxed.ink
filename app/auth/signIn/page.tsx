import { currentUser } from "@/auth/current-user";
import { redirect } from "next/navigation";
import { SignInPageClient } from "@/features/auth/SignInPageClient";

const page = async () => {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return <SignInPageClient />;
};

export default page;
