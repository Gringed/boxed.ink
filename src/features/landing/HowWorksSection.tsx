"use client";
import React from "react";
import { Section } from "./Section";
import { FadeInSection } from "./FadeInSection";
import { Play } from "lucide-react";

const HowWorksSection = () => {
  return (
    <FadeInSection>
      <div className="relative">
        <Section id="howworks" className="py-2 my-2 lg:my-20">
          <div className="flex flex-col justify-center w-full">
            <div className="flex items-center mb-16 gap-3 flex-col w-full justify-center">
              <h1 className="max-w-2xl text-center text-4xl font-black tracking-tight leading-none md:text-5xl text-noir">
                Build anything,{" "}
                <span className="text-primary">effortlessly</span>
              </h1>
              <p className="font-medium italic">"Very easily"</p>
            </div>

            {/* Demo video placeholder - replace this block with a <video> once the demo is recorded */}
            <div className="mx-auto w-full max-w-4xl aspect-video rounded-xl border border-neutral-300 bg-noir flex flex-col items-center justify-center gap-3">
              <div className="rounded-full bg-white/10 p-5">
                <Play className="h-10 w-10 text-white" fill="white" />
              </div>
              <span className="text-white/70 text-sm font-medium">
                Demo video coming soon
              </span>
            </div>
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
