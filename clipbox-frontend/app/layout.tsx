import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["600"],
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://clipbox.app'),
  title: "Clipbox",
  description: "Generate videos instantly",
  icons: {
    icon: "/favicon-new.png",
  },
  openGraph: {
    title: "Clipbox - Generate videos instantly",
    description: "ClipBox makes professional video processing simple. Upload your video, customize backgrounds and styling, and export stunning results.",
    url: "https://clipbox.app",
    siteName: "Clipbox",
    images: [
      {
        url: "/og-clipbox.png",
        width: 1200,
        height: 630,
        alt: "Clipbox Studio",
      },
    ],
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Clipbox",
    description: "Generate videos instantly",
    creator: "@clipbox",
    images: ["/og-clipbox.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className={`${inter.className}`}>
        {children}
      </body>
    </html>
  );
}
