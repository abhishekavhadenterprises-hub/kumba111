import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "./globals.css";
import { LanguageProvider } from "@/lib/context/language-context";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Simhastha Kumbh 2027 — Command Center | Nashik Gramin Police",
  description:
    "Advanced GIS Command & Control Dashboard for Simhastha Kumbh Mela Trimbakeshwar 2026-27. Real-time operational intelligence for Nashik Gramin Police.",
  keywords: "Simhastha, Kumbh Mela, Trimbakeshwar, Nashik Police, GIS, Dashboard, Command Center",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${jetbrainsMono.variable} h-full antialiased dark`}
    >
      <body className="h-full bg-[#FDFBF7] text-black overflow-hidden flex flex-col font-sans">
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
