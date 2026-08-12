"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { RotateCw } from "lucide-react";

// Without a boundary here, any unhandled client error replaced the whole
// page with Next's bare "Application error" text — no way back except
// closing the tab. The most common cause is a chunk that no longer exists
// after a deploy, which a full reload fixes, so that's the primary action.
export default function PlatformError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const t = useTranslations("error");

  useEffect(() => {
    console.error("[dashboard] client error:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[60vh] w-full flex-col items-center justify-center gap-4 p-6 text-center">
      <h1 className="text-xl font-bold text-noir">{t("title")}</h1>
      <p className="max-w-md text-sm text-noir/60">{t("description")}</p>
      <div className="flex flex-wrap items-center justify-center gap-2">
        <Button onClick={() => window.location.reload()}>
          <RotateCw size={15} className="mr-2" />
          {t("reload")}
        </Button>
        <Button variant="outline" onClick={reset}>
          {t("retry")}
        </Button>
      </div>
      {error.digest && (
        <p className="text-[10px] text-noir/30">ref: {error.digest}</p>
      )}
    </div>
  );
}
