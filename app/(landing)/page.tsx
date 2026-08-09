import { currentUser } from "@/auth/current-user";
import { HeroSection } from "@/features/landing/HeroSection";
import { LandingHeader } from "@/features/landing/LandingHeader";
import { prisma } from "@/prisma";
import "./landing.css";
import HowWorksSection from "@/features/landing/HowWorksSection";
import EditorPreviewSection from "@/features/landing/EditorPreviewSection";
import ShowcaseSection from "@/features/landing/ShowcaseSection";
import FAQSection from "@/features/landing/FAQSection";
import Footer from "@/features/landing/Footer";
import Pricing from "@/features/landing/Pricing";

export default async function Home() {
  const user = await currentUser();
  const sidefolio = user
    ? await prisma.sidefolio.findFirst({ where: { authorId: user.id } })
    : null;

  return (
    <div className="flex flex-col">
      <LandingHeader user={user} sidefolio={sidefolio} />
      <HeroSection user={user} />

      <HowWorksSection />
      <EditorPreviewSection />
      <ShowcaseSection />
      <Pricing />
      <FAQSection />
      <div
        className="relative bg-cover mt-20 border-t-4 border-primary"
        id="signup"
        style={{
          backgroundImage: "url(/back.svg)",
        }}
      >
        <Footer user={user} />
      </div>
    </div>
  );
}
