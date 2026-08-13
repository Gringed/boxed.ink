"use client";
import React from "react";
import { useTranslations } from "next-intl";

// Third-party ad-swap unit, embedded as a cross-origin iframe rather than the
// script-tag version: the ad code then runs in ad-swap.web.app's own document
// and can't reach our DOM, cookies or server actions, whatever they ship next.
// allow-same-origin keeps the frame on ITS origin (not ours) so the Firebase
// SDK can use storage; allow-popups lets the ad open in a new tab.
const FRAME_SRC =
  "https://ad-swap.web.app/frame.html?site=SZFMrEzDGPpTvTKqsmSy&shape=pill&theme=light";

export const AdSwapWidget = () => {
  const t = useTranslations("footer");

  return (
    <div className="flex w-full flex-col items-center gap-3 px-6 pb-10">
      <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-noir/35">
        {t("adSwapLabel")}
      </span>
      <iframe
        src={FRAME_SRC}
        title="Ad"
        loading="lazy"
        sandbox="allow-scripts allow-same-origin allow-popups"
        // Height fits the pill exactly (26px logo + padding + border) so the
        // frame never scrolls; the footer reserves the space up front.
        className="w-full max-w-[300px] border-0"
        style={{ height: 44 }}
      />
    </div>
  );
};
