"use client";

import { useState } from "react";
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
import { ArrowRight } from "lucide-react";
import { claimSidefolioSlugAction } from "@/lib/actions/sidefolio/sidefolio.actions";

type ClaimUrlDialogProps = {
  sidefolio: { id: string; slug: string };
};

// Shown once, right after the very first sign-up — the slug auto-generated
// from the account name is only a placeholder until the user confirms (or
// changes) it here. `sidefolio.slugClaimed` gates this: it flips to true on
// submit and the dialog never appears again after that.
export const ClaimUrlDialog = ({ sidefolio }: ClaimUrlDialogProps) => {
  const t = useTranslations("claimUrl");
  const router = useRouter();
  const [value, setValue] = useState(sidefolio.slug);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!value.trim()) {
      setError(t("invalid"));
      return;
    }
    setIsSubmitting(true);
    setError(null);
    const res = await claimSidefolioSlugAction({
      id: sidefolio.id,
      slug: value,
    });
    setIsSubmitting(false);
    if (res?.serverError) {
      setError(
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
          <div className="flex h-12 w-full items-stretch overflow-hidden rounded-md border border-noir/10 bg-white shadow-sm">
            <span className="flex shrink-0 items-center bg-noir/5 pl-5 pr-3 font-medium text-noir/70">
              boxed.ink/
            </span>
            <Input
              type="text"
              value={value}
              disabled={isSubmitting}
              onChange={(e) => {
                setValue(e.target.value);
                setError(null);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              className="h-full min-w-[6rem] flex-1 rounded-none border-0 bg-white py-0 pl-3 text-base shadow-none focus-visible:ring-0"
            />
          </div>
          {error && <p className="text-sm font-medium text-red-500">{error}</p>}
          <Button
            className="mt-2 h-12 w-full text-base"
            disabled={isSubmitting || !value.trim()}
            onClick={handleSubmit}
          >
            {t("cta")} <ArrowRight className="ml-2" size={15} />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
