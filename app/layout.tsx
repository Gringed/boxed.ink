import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Analytics } from "@vercel/analytics/react";
import { cn } from "../lib/utils";
import { InitialLoadOverlay } from "@/components/InitialLoadOverlay";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
const outfit = Outfit({ subsets: ["latin"], variable: "--font-outfit" });

export const metadata: Metadata = {
  title: "boxed.ink — the bento-grid link in bio",
  description:
    "Drag-and-drop blocks, links, images, live Twitch/YouTube cards, into a bento grid instead of a list. Free forever.",
  icons: {
    icon: ["/favicon.ico?v=7"],
    apple: ["/apple-touch-icon.png?v=4"],
    shortcut: ["/apple-touch-icon.png"],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html lang={locale} className="h-full">
      <body className={cn(outfit.className, outfit.variable, "h-full")}>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <InitialLoadOverlay />
          <Toaster position="top-center" />
          {children}
          <SpeedInsights />
          <Analytics />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
