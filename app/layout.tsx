import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Falsifi — Evidence-first Thesis Stress Lab",
  description:
    "Audit evidence independence, find joint assumption cliffs, and learn what would flip an investment thesis. Open source and local first.",
  other: {
    "codex-preview": "development",
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
