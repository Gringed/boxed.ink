"use client";

import { useTransition } from "react";
import { AnimatePresence } from "framer-motion";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { signInAction } from "./auth.action";
import { PageLoader } from "@/components/PageLoader";

export const SignInButton = () => {
  const t = useTranslations("header");
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        variant="default"
        className="rounded-full"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            signInAction();
          });
        }}
      >
        {t("enrollNow")}
      </Button>
      <AnimatePresence>{isPending && <PageLoader />}</AnimatePresence>
    </>
  );
};
