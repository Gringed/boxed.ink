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
  title: "boxed.ink",
  description: "Build your boxed.ink - the next-level portfolio",
  icons: {
    icon: ["/favicon.ico?v=5"],
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
