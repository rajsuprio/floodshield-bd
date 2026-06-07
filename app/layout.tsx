import type { Metadata } from "next";
import { Hind_Siliguri } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner"

const hindSiliguri = Hind_Siliguri({
  variable: "--font-sans",
  subsets: ["latin", "bengali"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "FloodShield BD",
  description: "FloodShield BD - Flood risk monitoring and claims management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${hindSiliguri.variable} h-full antialiased text-base md:text-lg`}>
      <body suppressHydrationWarning className="min-h-full flex flex-col">
        {children}
        <Toaster position="top-right" richColors />
      </body>
    </html>
  );
}
