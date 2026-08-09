"use client";
import { Section } from "./Section";
import { FadeInSection } from "./FadeInSection";
import { Quote } from "lucide-react";
import { useTranslations } from "next-intl";

const LinkCard = ({ rotate }: { rotate: string }) => (
  <div
    className={`shrink-0 w-40 sm:w-48 rounded-2xl border bg-white shadow-lg p-3 flex flex-col gap-2 ${rotate}`}
  >
    <div className="flex items-center gap-2">
      <div className="size-8 rounded-full bg-gray-100 border shrink-0" />
      <div className="flex-1">
        <div className="h-2 w-16 rounded-full bg-noir/70 mb-1.5" />
        <div className="h-1.5 w-10 rounded-full bg-noir/25" />
      </div>
    </div>
    <div className="aspect-video rounded-xl bg-gray-100" />
  </div>
);

const ImageCard = ({ rotate }: { rotate: string }) => (
  <div
    className={`shrink-0 w-36 sm:w-44 aspect-[3/4] rounded-2xl border bg-gradient-to-br from-gray-100 to-gray-200 shadow-lg ${rotate}`}
  />
);

const QuoteCard = ({ rotate }: { rotate: string }) => (
  <div
    className={`shrink-0 w-52 sm:w-60 rounded-2xl border bg-white shadow-lg p-4 flex flex-col gap-2 ${rotate}`}
  >
    <Quote className="text-primary" size={18} />
    <div className="h-2 w-full rounded-full bg-noir/20" />
    <div className="h-2 w-4/5 rounded-full bg-noir/20" />
    <div className="h-2 w-2/3 rounded-full bg-noir/20" />
  </div>
);

const TwitchCard = ({ rotate }: { rotate: string }) => (
  <div
    className={`shrink-0 w-40 sm:w-48 rounded-2xl border bg-white shadow-lg p-3 flex flex-col gap-2 ${rotate}`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="size-8 rounded-full bg-gray-100 border shrink-0" />
      <span className="inline-flex items-center gap-1 rounded-full bg-[#9146FF]/10 text-[#9146FF] text-[10px] font-bold px-2 py-0.5">
        <img
          src="https://www.google.com/s2/favicons?sz=64&domain=twitch.tv"
          alt="Twitch"
          className="size-2.5 object-contain"
        />
        Live
      </span>
    </div>
    <div className="h-2 w-20 rounded-full bg-noir/70" />
    <div className="aspect-video rounded-xl bg-[#9146FF]/10" />
  </div>
);

const YouTubeCard = ({ rotate }: { rotate: string }) => (
  <div
    className={`shrink-0 w-40 sm:w-48 rounded-2xl border bg-white shadow-lg p-3 flex flex-col gap-2 ${rotate}`}
  >
    <div className="flex items-center justify-between gap-2">
      <div className="size-8 rounded-full bg-gray-100 border shrink-0" />
      <span className="inline-flex items-center gap-1 rounded-full bg-[#FF0000]/10 text-[#FF0000] text-[10px] font-bold px-2 py-0.5">
        <img
          src="https://www.google.com/s2/favicons?sz=64&domain=youtube.com"
          alt="YouTube"
          className="size-2.5 object-contain"
        />
        12K
      </span>
    </div>
    <div className="h-2 w-24 rounded-full bg-noir/70" />
    <div className="grid grid-cols-2 gap-1.5">
      <div className="aspect-video rounded-lg bg-[#FF0000]/10" />
      <div className="aspect-video rounded-lg bg-[#FF0000]/10" />
    </div>
  </div>
);

const ShowcaseSection = () => {
  const t = useTranslations("showcase");
  return (
    <FadeInSection>
      <Section className="py-2 my-2 lg:my-20 !max-w-full">
        <div className="flex flex-col justify-center w-full gap-16">
          <div className="flex items-center gap-3 flex-col w-full justify-center px-8">
            <h1 className="max-w-2xl text-center text-4xl font-black tracking-tight leading-none md:text-5xl text-noir">
              {t("titlePrefix")}{" "}
              <span className="text-primary">{t("titleHighlight")}</span>
            </h1>
            <p className="max-w-xl text-center font-medium text-noir/70">
              {t("subtitle")}
            </p>
          </div>

          <div
            className="w-full overflow-hidden"
            style={{
              maskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
              WebkitMaskImage:
                "linear-gradient(to right, transparent, black 12%, black 88%, transparent)",
            }}
          >
            <div className="flex items-center gap-4 sm:gap-6 w-max px-8">
              <LinkCard rotate="-rotate-3" />
              <ImageCard rotate="rotate-2" />
              <QuoteCard rotate="-rotate-1" />
              <TwitchCard rotate="rotate-3" />
              <YouTubeCard rotate="-rotate-2" />
              <ImageCard rotate="rotate-1" />
              <LinkCard rotate="-rotate-2" />
            </div>
          </div>
        </div>
      </Section>
    </FadeInSection>
  );
};

export default ShowcaseSection;
