import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MarketPulse | Market intelligence workspace",
  description: "A fixture-only market intelligence dashboard foundation.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
