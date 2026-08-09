"use client";
import { Section } from "./Section";
import { FadeInSection } from "./FadeInSection";
import { MousePointer2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const EditorPreviewSection = () => {
  const t = useTranslations("editorPreview");
  return (
    <FadeInSection>
      <Section className="py-2 my-2 lg:my-20">
        <div className="flex flex-col justify-center w-full">
          <div className="flex items-center mb-16 gap-3 flex-col w-full justify-center">
            <h1 className="max-w-2xl text-center text-4xl font-black tracking-tight leading-none md:text-5xl text-noir">
              {t("titlePrefix")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h1>
            <p className="max-w-xl text-center font-medium text-noir/70">
              {t("subtitle")}
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-3xl">
            <div className="hidden md:flex absolute -left-10 top-6 items-center justify-center h-12 w-12 rounded-2xl bg-white border shadow-lg -rotate-6">
              <Sparkles className="text-[#F5A244]" size={22} />
            </div>
            <div className="hidden md:flex absolute -right-8 bottom-10 items-center justify-center h-12 w-12 rounded-2xl bg-white border shadow-lg rotate-6">
              <MousePointer2 className="text-primary" size={22} />
            </div>

            <div className="rounded-2xl border bg-white shadow-2xl p-4 sm:p-6 flex gap-4 sm:gap-6">
              <div className="flex flex-col items-start gap-2 shrink-0 w-20 sm:w-32 pt-1">
                <div className="size-10 sm:size-16 rounded-full bg-gray-100 border" />
                <div className="h-2.5 w-14 sm:w-20 rounded-full bg-noir/80" />
                <div className="h-2 w-10 sm:w-14 rounded-full bg-noir/20" />
                <div className="h-2 w-12 sm:w-16 rounded-full bg-noir/20" />
              </div>

              <div className="grid grid-cols-2 gap-2 sm:gap-3 flex-1">
                <div className="col-span-2 h-9 rounded-xl bg-noir/5 flex items-center px-3">
                  <div className="h-2.5 w-24 rounded-full bg-noir/60" />
                </div>
                <div className="aspect-square rounded-xl bg-gray-100 border" />
                <div className="aspect-square rounded-xl border p-2 flex flex-col gap-1.5 relative">
                  <div className="flex items-center gap-1.5">
                    <div className="size-5 rounded-full bg-[#9146FF]/15 flex shrink-0 items-center justify-center overflow-hidden">
                      <img
                        src="https://www.google.com/s2/favicons?sz=64&domain=twitch.tv"
                        alt="Twitch"
                        className="size-3 object-contain"
                      />
                    </div>
                    <div className="h-1.5 w-10 rounded-full bg-noir/30" />
                  </div>
                  <div className="flex-1 rounded-lg bg-[#9146FF]/10" />
                  <MousePointer2
                    size={20}
                    className="absolute -bottom-3 -right-3 text-noir drop-shadow-lg"
                    fill="white"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </Section>
      <div className="h-[200px] w-full  overflow-hidden ">
        <div className=" h-full -rotate-3 w-[200%] -ml-8 bg-primary"></div>
      </div>
    </FadeInSection>
  );
};

export default EditorPreviewSection;
