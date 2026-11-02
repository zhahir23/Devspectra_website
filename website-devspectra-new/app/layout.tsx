import type { Metadata } from "next";
import { Geist, Geist_Mono, Inter } from "next/font/google";
import "./globals.css";

import Footer from "./components/Footer";
import Sidebar from "./components/Sidebar";
import WelcomeIntro from "./components/WelcomeIntro";
import ThemeProvider from "./components/ThemeProvider";
import ScrollButtons from "./components/ScrollButtons";
import { INTRO_SCRIPT } from "./lib/welcome-intro";
import { cn } from "@/lib/utils";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Devspectra Digital Kreasi",
  description: "Company jasa IT dan digital marketing di Indonesia",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("font-sans overflow-x-hidden", inter.variable)}
    >
      <body
        className={`${geistSans.variable} ${geistMono.variable} animated-bg antialiased
          text-zinc-900 transition-colors duration-300
          dark:text-zinc-100`}
      >
        {/* Pilih "Welcome" / "Welcome Back" / tidak tampil sebelum halaman terlihat (app/lib/welcome-intro.ts) */}
        <script dangerouslySetInnerHTML={{ __html: INTRO_SCRIPT }} />
        <ThemeProvider>
          <WelcomeIntro />
          <div className="flex min-h-screen">
            <Sidebar />
            <div className="min-w-0 flex-1 md:ml-[260px]">
              <main className="min-h-screen w-full">
                {children}
              </main>
              <Footer />
            </div>
          </div>
          <ScrollButtons />
        </ThemeProvider>
      </body>
    </html>
  );
}
