"use client";
import React, { useEffect, useRef } from "react";
import { useTranslations } from "next-intl";

const SCRIPT_SRC = "https://ad-swap.web.app/widget.js";
const SITE_ID = "SZFMrEzDGPpTvTKqsmSy";
const TARGET_ID = "adswap-slot";

// Third-party ad-swap pill. Landing pages only — never the dashboard or a
// published page, so it can't run alongside an editing session or on someone
// else's page.
export const AdSwapWidget = () => {
  const t = useTranslations("footer");
  const slotRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Injected on mount rather than through next/script: the widget body runs
    // once per script element, so after a client-side navigation a reused tag
    // would leave the slot empty. data-target keeps the ad in our own div
    // instead of wherever the script tag happens to land.
    const script = document.createElement("script");
    script.src = SCRIPT_SRC;
    script.async = true;
    script.dataset.siteId = SITE_ID;
    script.dataset.shape = "pill";
    script.dataset.target = TARGET_ID;
    script.dataset.theme = "light";
    document.body.appendChild(script);
    return () => {
      script.remove();
      if (slotRef.current) slotRef.current.innerHTML = "";
    };
  }, []);

  return (
    <div className="flex w-full flex-col items-center gap-3 px-6 pb-10">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-noir/35">
        {t("adSwapLabel")}
      </span>
      {/* min-h keeps the footer from jumping while the widget loads. */}
      <div
        id={TARGET_ID}
        ref={slotRef}
        className="adswap-slot flex min-h-[42px] items-center justify-center"
      />
    </div>
  );
};
