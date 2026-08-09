"use client";
import { Section } from "./Section";
import { FadeInSection } from "./FadeInSection";
import { Plus } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import { useTranslations } from "next-intl";

const faqKeys = [
  "free",
  "different",
  "code",
  "twitch",
  "linktree",
  "mobile",
] as const;

const FAQSection = () => {
  const t = useTranslations("faq");
  return (
    <FadeInSection>
      <Section className="py-2 my-2 lg:my-20">
        <div className="flex w-full flex-col md:flex-row gap-10 md:gap-16">
          <div className="flex flex-col gap-4 md:w-1/3 md:sticky md:top-32 md:self-start">
            <h1 className="text-3xl font-black tracking-tight leading-none md:text-4xl text-noir">
              {t("title")}
            </h1>
            <p className="font-medium text-noir/70">{t("subtitle")}</p>
            <p className="font-medium text-noir">{t("readyPrompt")}</p>
            <Link
              href="/auth/signIn"
              className={cn(
                buttonVariants({ variant: "default" }),
                "w-fit font-bold"
              )}
            >
              {t("cta")}
            </Link>
          </div>

          <div className="flex-1 flex flex-col divide-y divide-noir/10 border-t border-b border-noir/10">
            {faqKeys.map((key) => (
              <details key={key} className="group py-4">
                <summary className="flex items-center justify-between gap-4 cursor-pointer list-none font-bold text-noir">
                  {t(`items.${key}.q`)}
                  <Plus
                    size={18}
                    className="shrink-0 text-noir/50 transition-transform group-open:rotate-45"
                  />
                </summary>
                <p className="mt-3 text-noir/70 font-medium">
                  {t(`items.${key}.a`)}
                </p>
              </details>
            ))}
          </div>
        </div>
      </Section>
    </FadeInSection>
  );
};

export default FAQSection;
