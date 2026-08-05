"use client";
import React, { useEffect, useRef, useState, useTransition } from "react";
import { Section } from "./Section";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FadeInSection } from "./FadeInSection";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, CopyrightIcon } from "lucide-react";
import Image from "next/image";
import { AnimatePresence } from "framer-motion";
import { signInAction } from "../auth/auth.action";
import { PageLoader } from "@/components/PageLoader";

const Footer = () => {
  const [name, setName] = useState<String>();
  const [isPending, startTransition] = useTransition();
  return (
    <FadeInSection>
      <Section
        id="signup"
        className="py-2 !max-w-full  bg-gray-100 w-full col-start-1 row-start-1 h-full bg-opacity-20"
      >
        <section
          className=" col-start-1 row-start-1 grid place-items-center w-full h-full overflow-hidden min-h-screen"
          id="signup"
        >
          <div className="col-start-1 row-start-1 text-center ">
            <div className="max-w-4xl space-y-12 md:space-y-24 p-6">
              <h2 className="text-5xl relative font-black text-primary  md:text-6xl md:leading-tight lg:text-7xl lg:leading-tight">
                Build now!
                <Image
                  unselectable="on"
                  className="absolute  pointer-events-none  left-0 sm:left-1/4 inset-x-0"
                  src={"lines.svg"}
                  width={200}
                  height={20}
                  alt="d"
                />
              </h2>
              <div className="max-w-2xl mx-auto">
                <div className="flex h-12 w-full items-stretch overflow-hidden rounded-md border border-noir/10 bg-white shadow-sm">
                  <span className="flex shrink-0 items-center bg-noir/5 pl-5 pr-3 font-medium text-noir/70">
                    bentoh.me/
                  </span>
                  <Input
                    type="text"
                    placeholder="yourname"
                    className="h-full min-w-[6rem] flex-1 rounded-none border-0 bg-white py-0 pl-3 text-base shadow-none focus-visible:ring-0"
                    required
                    onChange={(e) => setName(e.target.value)}
                  />
                  <Button
                    className="h-full shrink-0 rounded-none px-6 text-base"
                    disabled={!name || isPending}
                    onClick={() => {
                      startTransition(() => signInAction());
                    }}
                  >
                    Claim and start building{" "}
                    <ArrowRight className="ml-2" size={15} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </section>
      </Section>
      <div className="w-full relative bg-primary text-white  border-t-4 border-black">
        <Section className="py-10">
          <div className="flex flex-col justify-center w-full">
            <div className="flex items-center lg:justify-between flex-col lg:flex-row gap-5 my-5 lg:my-1">
              <div className="flex items-center gap-3 font-medium">
                <CopyrightIcon />
                {new Date().getFullYear()} ♥ bentoh.me
              </div>
              <div className="flex gap-5 font-medium flex-col lg:flex-row flex-wrap items-center">
                <Link href={"/changelog"}>Changelog</Link>
                <Link href={"/tos"}>Terms</Link>
                <Link href={"/policy"}>Privacy Policy</Link>
                <Link
                  href={
                    "mailto:alexandre.guillome@yucatech.fr?subject=Help me with bentoh.me"
                  }
                >
                  Contact
                </Link>
                <Link
                  href="https://calendly.com/alexandre-guillome/premiere-impression"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Made by Alexandre
                </Link>
              </div>
            </div>
          </div>
        </Section>
      </div>
      <AnimatePresence>{isPending && <PageLoader />}</AnimatePresence>
    </FadeInSection>
  );
};

export default Footer;
