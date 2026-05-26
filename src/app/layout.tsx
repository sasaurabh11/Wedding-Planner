import type { Metadata } from "next";
import { DM_Sans, Playfair_Display } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const dmSans = DM_Sans({
  variable: "--font-dm-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const playfairDisplay = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "Wedding Planner AI — Your Personalized Wedding Budget & Vendor Guide",
  description:
    "AI-powered wedding planning that creates a personalized vendor budget and recommendations based on your preferences, city, and guest count.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSans.variable} ${playfairDisplay.variable} antialiased`}
    >
      <body className="min-h-screen bg-[#FDFAF5] text-[#1C1917]">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
