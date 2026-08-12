"use client";
import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";

// The OAuth callbacks can't render anything themselves — they redirect back
// with ?social=<platform>&status=<result>. This picks that up, shows it, and
// strips the params so a refresh doesn't replay the message.
export const SocialConnectToast = () => {
  const t = useTranslations("editor");
  const router = useRouter();
  const searchParams = useSearchParams();
  const handled = useRef(false);

  const social = searchParams.get("social");
  const status = searchParams.get("status") || searchParams.get("error");

  useEffect(() => {
    if (!social || !status || handled.current) return;
    handled.current = true;

    switch (status) {
      case "connected":
        toast.success(t("socialConnected"));
        break;
      case "cancelled":
        toast.info(t("socialCancelled"));
        break;
      case "personal_account":
        // The actionable one: tells the user exactly which setting to change
        // rather than just saying it failed. Long-lived on purpose.
        toast.error(t("socialPersonalAccount"), { duration: 12000 });
        break;
      case "not_configured":
        toast.error(t("socialNotConfigured"));
        break;
      default:
        toast.error(t("socialError"));
    }

    router.replace("/dashboard");
  }, [social, status, t, router]);

  return null;
};
