import type { Metadata } from "next";
import { Varela, Geist_Mono } from "next/font/google";
import "./globals.css";

const varela = Varela({
  variable: "--font-varela",
  weight: "400",
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GlassTab - Custom New Tab Page",
  description: "A fast, beautiful, customizable glassmorphism new tab page.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      suppressHydrationWarning
      lang="en"
      className={`${varela.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://www.google.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://www.bing.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://apod.nasa.gov" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://www.google.com" />
        <link rel="dns-prefetch" href="https://www.bing.com" />
        <link rel="dns-prefetch" href="https://apod.nasa.gov" />
      </head>
      <body className="bg-background min-h-dvh font-sans text-foreground antialiased">{children}</body>
    </html>
  );
}
