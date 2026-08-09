import { currentUser } from "@/auth/current-user";
import { prisma } from "@/prisma";
import { redirect } from "next/navigation";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { UpgradeView } from "@/features/platform/upgrade/UpgradeView";

export const dynamic = "force-dynamic";

const UpgradePage = async () => {
  const user = await currentUser();

  if (!user) {
    redirect("/auth/signIn");
  }

  const sidefolio = await prisma.sidefolio.findFirst({
    where: { authorId: user.id },
  });

  return (
    <div className="flex flex-col min-h-full">
      <LandingHeader user={user} sidefolio={sidefolio} />
      <UpgradeView user={user} sidefolio={sidefolio} />
    </div>
  );
};

export default UpgradePage;
