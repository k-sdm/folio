import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

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

export const metadata: Metadata = {
  title: "Kiran Scott — Personal Site",
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
      className={`${khTeka.variable} h-full antialiased`}
    >
      <body className="min-h-full bg-background text-foreground">
        {children}
      </body>
    </html>
  );
}
