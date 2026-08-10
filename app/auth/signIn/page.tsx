import { currentUser } from "@/auth/current-user";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { SignInPageClient } from "@/features/auth/SignInPageClient";

const page = async () => {
  const user = await currentUser();

  if (user) {
    redirect("/dashboard");
  }

  return (
    <Suspense>
      <SignInPageClient />
    </Suspense>
  );
};

export default page;
