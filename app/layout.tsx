import type { Metadata } from "next";
import { displayFont, bodyFont } from "@/lib/fonts";
import { SmoothScrollProvider } from "@/components/layout/SmoothScrollProvider";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Preloader } from "@/components/layout/Preloader";
import { CustomCursor } from "@/components/layout/CustomCursor";
import { WhatsAppFab } from "@/components/layout/WhatsAppFab";
import { PageTransition } from "@/components/layout/PageTransition";
import "./globals.css";

export const metadata: Metadata = {
  title: "MAP Fitness — Your Limit Is You",
  description:
    "MAP (Muscle and Performance): a Bengaluru gym built for strength and flexibility together — calisthenics, HYROX, MMA, Pilates, and a full recovery floor.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${displayFont.variable} ${bodyFont.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-midnight">
        <Preloader />
        <CustomCursor />
        <SmoothScrollProvider>
          <Navbar />
          <PageTransition>
            <main className="flex-1">{children}</main>
          </PageTransition>
          <Footer />
          <WhatsAppFab />
        </SmoothScrollProvider>
      </body>
    </html>
  );
}
