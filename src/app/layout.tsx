import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";

const khTeka = localFont({
  src: [
    { path: "../fonts/KHTeka-Light.otf", weight: "300", style: "normal" },
    { path: "../fonts/KHTeka-LightItalic.otf", weight: "300", style: "italic" },
    { path: "../fonts/KHTeka-Regular.otf", weight: "400", style: "normal" },
    { path: "../fonts/KHTeka-RegularItalic.otf", weight: "400", style: "italic" },
    { path: "../fonts/KHTeka-Medium.otf", weight: "500", style: "normal" },
    { path: "../fonts/KHTeka-MediumItalic.otf", weight: "500", style: "italic" },
    { path: "../fonts/KHTeka-Bold.otf", weight: "700", style: "normal" },
    { path: "../fonts/KHTeka-BoldItalic.otf", weight: "700", style: "italic" },
    { path: "../fonts/KHTeka-Black.otf", weight: "900", style: "normal" },
    { path: "../fonts/KHTeka-BlackItalic.otf", weight: "900", style: "italic" },
  ],
  variable: "--font-kh-teka",
  display: "swap",
});

const khTekaMono = localFont({
  src: [{ path: "../fonts/KHTekaMonoTRIAL-Bold.otf", weight: "700", style: "normal" }],
  variable: "--font-kh-teka-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kiran Scott de Martinville",
  description: "Personal website and portfolio of Kiran Scott.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${khTeka.variable} ${khTekaMono.variable} antialiased`}
    >
      <body className="bg-background text-foreground">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
