"use client";
import { useEffect } from "react";

// Last-resort boundary: it replaces the root layout, so the i18n provider
// isn't available here and the copy stays hardcoded and short.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("[app] fatal client error:", error);
  }, [error]);

  return (
    <html lang="en">
      <body
        style={{
          display: "flex",
          minHeight: "100vh",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "24px",
          textAlign: "center",
          fontFamily: "system-ui, sans-serif",
          color: "#14171d",
        }}
      >
        <h1 style={{ fontSize: "20px", fontWeight: 700 }}>
          Something went wrong
        </h1>
        <p style={{ fontSize: "14px", opacity: 0.6, maxWidth: "420px" }}>
          Reloading usually fixes it. If it keeps happening, let us know.
        </p>
        <button
          onClick={() => window.location.reload()}
          style={{
            borderRadius: "999px",
            border: "1px solid #14171d",
            padding: "8px 20px",
            fontSize: "14px",
            fontWeight: 700,
            cursor: "pointer",
            background: "#14171d",
            color: "#fff",
          }}
        >
          Reload
        </button>
      </body>
    </html>
  );
}
