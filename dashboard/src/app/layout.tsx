import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhrmshree — AI Pentest Engine",
  description: "Autonomous AI-Powered Security & QA Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
