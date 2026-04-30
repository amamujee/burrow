import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  applicationName: "Burrow",
  title: "Burrow",
  description: "Let your Kid go deep with bite-size learning games about peppers, tall buildings, sharks, reading, and math.",
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icons/burrow-icon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/icons/burrow-icon-64.png", sizes: "64x64", type: "image/png" },
    ],
    apple: [
      { url: "/icons/burrow-icon-120.png", sizes: "120x120", type: "image/png" },
      { url: "/icons/burrow-icon-152.png", sizes: "152x152", type: "image/png" },
      { url: "/icons/burrow-icon-167.png", sizes: "167x167", type: "image/png" },
      { url: "/icons/burrow-icon-180.png", sizes: "180x180", type: "image/png" },
    ],
  },
  appleWebApp: {
    capable: true,
    title: "Burrow",
    statusBarStyle: "black-translucent",
  },
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
