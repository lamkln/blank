import type { Metadata } from "next";
import { IBM_Plex_Mono } from "next/font/google";
import "./globals.css";

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  variable: "--font-mono",
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Blank — The AI-only IDE",
  description:
    "Chat on the left, live preview on the right. No file tree, no tabs — just you and the agent. Windows, macOS, and Linux.",
  openGraph: {
    title: "Blank — The AI-only IDE",
    description:
      "An AI-only desktop IDE with approval-based edits, multi-provider support, and local API keys.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={mono.variable}>
      <body>{children}</body>
    </html>
  );
}
