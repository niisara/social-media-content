import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Scheduling Dashboard",
  description: "Cross-brand content scheduling dashboard",
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
