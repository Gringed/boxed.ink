"use client";
import React from "react";
import { Section } from "./Section";
import { FadeInSection } from "./FadeInSection";
import { useTranslations } from "next-intl";

const HowWorksSection = () => {
  const t = useTranslations("howWorks");
  return (
    <FadeInSection>
      <div className="relative">
        <Section id="howworks" className="py-2 my-2 lg:my-20">
          <div className="flex flex-col justify-center w-full">
            <div className="flex items-center mb-16 gap-3 flex-col w-full justify-center">
              <h1 className="max-w-2xl text-center text-4xl font-black tracking-tight leading-none md:text-5xl text-noir">
                {t("titlePrefix")}{" "}
                <span className="text-primary">{t("titleHighlight")}</span>
              </h1>
              <p className="font-medium italic">{t("quote")}</p>
            </div>

            <video
              className="mx-auto w-full max-w-4xl aspect-video rounded-xl border border-neutral-300 bg-gray-100 object-contain"
              src="https://res.cloudinary.com/dhgoagdvr/video/upload/v1786115772/Sidepro/bentoh.me_hero_hfjrz8.mp4"
              autoPlay
              muted
              loop
              playsInline
            />
          </div>
        </Section>
      </div>
      <div className="h-[200px] w-full  overflow-hidden ">
        <div className=" h-full -rotate-3 w-[200%] -ml-8 bg-primary"></div>
      </div>
    </FadeInSection>
  );
};

export default HowWorksSection;
