import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Inter, Instrument_Serif } from "next/font/google";


import "./styles/globals.css";

interface Props {
  readonly children: ReactNode;
}

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  variable: "--font-serif",
  display: "swap",
});

const rawSiteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://zwanga-app.com";
const siteUrl =
  rawSiteUrl.startsWith("http://") || rawSiteUrl.startsWith("https://")
    ? rawSiteUrl
    : `https://${rawSiteUrl}`;

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Zwanga | Covoiturage Kinshasa et trajet sécurisé",
    template: "%s | Zwanga",
  },
  description:
    "Zwanga est une application de transport de covoiturage Kinshasa. Trouvez un conducteur ou proposez un trajet sécurisé au quotidien.",
  applicationName: "Zwanga",
  manifest: "/manifest.webmanifest",
  keywords: [
    "Zwanga",
    "covoiturage Kinshasa",
    "trajet sécurisé",
    "application de transport",
    "conducteur",
    "passager",
  ],
  authors: [{ name: "Zwanga" }],
  creator: "Zwanga",
  publisher: "Zwanga",
  category: "transport",
  icons: {
    icon: "/icon.ico",
    shortcut: "/icon.ico",
    apple: "/zwanga.png",
  },
  openGraph: {
    title: "Zwanga | Mema nga, na mema yo, to memana",
    description:
      "Application de transport locale à Kinshasa pour passagers et conducteurs avec suivi en direct et outils de sécurité.",
    url: siteUrl,
    siteName: "Zwanga",
    locale: "fr_CD",
    type: "website",
    images: [
      {
        url: "/zwanga.png",
        width: 512,
        height: 512,
        alt: "Logo Zwanga",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Zwanga | Mema nga, na mema yo, to memana",
    description:
      "Covoiturage urbain à Kinshasa: passager et conducteur sur la même application, avec trajet sécurisé.",
    images: ["/zwanga.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-video-preview": -1,
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({ children }: Props) {
  return (
    <html lang="fr" className={`${inter.variable} ${instrumentSerif.variable}`} suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
