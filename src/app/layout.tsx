import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Brainstorm — Think together.",
    template: "%s · Brainstorm",
  },
  description:
    "A shared space for ideas, chaos and questionable decisions. Brainstorm with your friends in real time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
      style={{ colorScheme: "dark" }}
    >
      <body className="min-h-full flex flex-col bg-background">
        <TooltipProvider delay={250}>
          {children}
          <Toaster richColors position="bottom-right" theme="dark" />
        </TooltipProvider>
      </body>
    </html>
  );
}
