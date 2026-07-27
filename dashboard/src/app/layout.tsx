import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Bhrmshree — AI Security & QA Platform",
  description: "Autonomous AI-Powered Security Testing & QA Platform. Hack the Happy Path.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
      </head>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
