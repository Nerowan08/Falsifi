import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Falsifi — Source-linked Stock Thesis Stress Test",
  description:
    "Build a source-linked stock research case, check evidence dependencies, and test which scenario inputs would change the current assessment.",
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
