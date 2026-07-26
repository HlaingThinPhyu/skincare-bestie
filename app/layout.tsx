import type { Metadata } from "next";
import { Geist, Geist_Mono, Noto_Sans_Myanmar } from "next/font/google";
import { ThemeProvider } from "@/lib/ThemeContext";
import { I18nProvider } from "@/lib/i18n";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const notoMyanmar = Noto_Sans_Myanmar({
  variable: "--font-myanmar",
  subsets: ["myanmar"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "Skincare Scout — AI-Powered Routine Builder",
  description:
    "Get a personalized skincare routine researched live by AI. Enter your skin type, concern, and budget — Skincare Scout finds real products with real prices.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${notoMyanmar.variable} h-full antialiased`}
    >
      <head>
        <!-- Privacy-friendly analytics by Plausible -->
        <script async src="https://plausible.io/js/pa-joFXTgVXaa1z8tGLLQDbN.js"></script>
        <script>
          window.plausible=window.plausible||function(){(plausible.q=plausible.q||[]).push(arguments)},plausible.init=plausible.init||function(i){plausible.o=i||{}};
          plausible.init()
        </script>

      </head>
      <body className="min-h-full flex flex-col">
        <ThemeProvider>
          <I18nProvider>{children}</I18nProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
