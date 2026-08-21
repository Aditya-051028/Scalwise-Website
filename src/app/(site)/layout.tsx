import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "700"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Scalwise Media | Scale Smarter",
    template: "%s | Scalwise Media",
  },
  description:
    "Scalwise Media turns ad spend and content into predictable growth for local and D2C brands — through performance ads, GBP/local SEO, and content that actually converts.",
};

export const viewport: Viewport = {
  themeColor: "#12051F",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable} antialiased`}
    >
      <body className="min-h-svh flex flex-col bg-void text-paper">
        {children}
      </body>
    </html>
  );
}
