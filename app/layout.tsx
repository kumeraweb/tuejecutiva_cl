import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import Footer from "./components/Footer";

const inter = Inter({
  subsets: ["latin"],
});

const defaultTitle = "TuEjecutiva";
const defaultDescription =
  "Portal de confianza que conecta usuarios con ejecutivas de contratacion verificadas en Chile. Evita estafas y contacta profesionales validadas.";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;

export const metadata: Metadata = {
  metadataBase: siteUrl ? new URL(siteUrl) : undefined,
  title: {
    default: defaultTitle,
    template: `%s | ${defaultTitle}`,
  },
  description: defaultDescription,
  keywords: [
    "ejecutivas verificadas",
    "ejecutivas de contratacion",
    "portal de confianza",
    "contratar planes",
    "asesoria de contratacion",
    "isapres",
    "seguros",
    "servicios hogar",
  ],
  icons: {
    icon: "/favicon.png",
  },
  alternates: siteUrl ? { canonical: siteUrl } : undefined,
  openGraph: {
    type: "website",
    url: siteUrl,
    title: defaultTitle,
    description: defaultDescription,
    siteName: "TuEjecutiva",
    images: ["/og-image.jpg"],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: ["/og-image.jpg"],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body
        className={`${inter.className} bg-gray-50 text-slate-900 min-h-full flex flex-col`}
      >
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
