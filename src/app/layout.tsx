import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Rabbit Hole",
  description: "Bite-size learning games about peppers, tall buildings, sharks, reading, and math.",
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
