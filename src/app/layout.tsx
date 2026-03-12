import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "FPL Analytics Dashboard",
  description: "Fantasy Premier League Analytics",
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
