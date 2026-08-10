"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, CirclePlus, Loader2 } from "lucide-react";
import { claimSidefolioSlugAction } from "@/lib/actions/sidefolio/sidefolio.actions";
import { verifySlug } from "@/lib/actions/sections/section.actions";
import { slugify } from "@/lib/slug";

type ClaimUrlDialogProps = {
  sidefolio: { id: string; slug: string };
};

// Shown once, right after the very first sign-up — the slug auto-generated
// from the account name is only a placeholder until the user confirms (or
// changes) it here. `sidefolio.slugClaimed` gates this: it flips to true on
// submit and the dialog never appears again after that.
//
// Availability check mirrors LoggedInDropdown's "Change my boxed.ink name"
// dialog (same `verifySlug` action, same live-as-you-type check) — without
// it, submitting an already-taken slug hit an unhandled Prisma unique
// constraint error instead of a friendly message.
export const ClaimUrlDialog = ({ sidefolio }: ClaimUrlDialogProps) => {
  const t = useTranslations("claimUrl");
  const router = useRouter();
  const [value, setValue] = useState(sidefolio.slug);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isUnchanged = value === sidefolio.slug;
  const canSubmit = !!value && (isUnchanged || isAvailable);

  const latestValueRef = useRef(value);
  const checkTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    return () => {
      if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);
    };
  }, []);

  const runCheck = async (next: string) => {
    try {
      const res = await verifySlug({ value: next });
      if (latestValueRef.current !== next) return; // stale response, ignore
      setIsAvailable(!!res.data);
    } catch {
    } finally {
      if (latestValueRef.current === next) setIsChecking(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const next = slugify(e.target.value);
    setValue(next);
    latestValueRef.current = next;
    setIsAvailable(false);

    if (checkTimeoutRef.current) clearTimeout(checkTimeoutRef.current);

    if (!next || next === sidefolio.slug) {
      setIsChecking(false);
      return;
    }

    // Wait for a 0.5s pause in typing before actually checking.
    setIsChecking(true);
    checkTimeoutRef.current = setTimeout(() => runCheck(next), 500);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setIsSubmitting(true);
    const res = await claimSidefolioSlugAction({
      id: sidefolio.id,
      slug: value,
    });
    setIsSubmitting(false);
    if (res?.serverError) {
      toast.error(
        res.serverError.toLowerCase().includes("taken")
          ? t("taken")
          : res.serverError
      );
      return;
    }
    toast.success(t("cta"));
    router.refresh();
  };

  return (
    <Dialog open>
      <DialogContent
        className="[&>button]:hidden"
        onEscapeKeyDown={(e) => e.preventDefault()}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("subtitle")}</DialogDescription>
        </DialogHeader>
        <div className="flex flex-col gap-2">
          <p className="text-sm font-semibold text-noir">
            {t("handlePrompt")}
          </p>
          <div className="relative flex h-12 w-full items-stretch overflow-hidden rounded-md border border-noir/10 bg-white shadow-sm">
            <span className="flex shrink-0 items-center bg-noir/5 pl-5 pr-3 font-medium text-noir/70">
              boxed.ink/
            </span>
            <Input
              type="text"
              value={value}
              disabled={isSubmitting}
              onChange={handleChange}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="h-full min-w-[6rem] flex-1 rounded-none border-0 bg-white py-0 pl-3 pr-9 text-base shadow-none focus-visible:ring-0"
            />
            <div className="absolute right-3 top-1/2 -translate-y-1/2">
              {isChecking ? (
                <Loader2 size={18} className="animate-spin text-noir/50" />
              ) : isUnchanged ? null : isAvailable ? (
                <CheckCircle2 size={18} className="text-primary" />
              ) : (
                <CirclePlus size={18} className="rotate-45 text-destructive" />
              )}
            </div>
          </div>
          {!isChecking && !isUnchanged && !isAvailable && value && (
            <p className="text-sm font-medium text-red-500">{t("taken")}</p>
          )}
          <Button
            className="mt-2 h-12 w-full text-base"
            disabled={isSubmitting || isChecking || !canSubmit}
            onClick={handleSubmit}
          >
            {t("cta")} <ArrowRight className="ml-2" size={15} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
