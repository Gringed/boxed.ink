"use client";

import { useTransition } from "react";
import { AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { signInAction } from "./auth.action";
import { PageLoader } from "@/components/PageLoader";

export const SignInButton = () => {
  const [isPending, startTransition] = useTransition();

  return (
    <>
      <Button
        variant="default"
        disabled={isPending}
        onClick={() => {
          startTransition(() => {
            signInAction();
          });
        }}
      >
        Enroll now
      </Button>
      <AnimatePresence>{isPending && <PageLoader />}</AnimatePresence>
    </>
  );
};
