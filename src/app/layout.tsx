import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import { APPLE_STARTUP_IMAGES } from "./apple-startup-images";
import Providers from "./providers";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_KEYWORDS,
  OG_IMAGE_PATH,
  SITE_NAME,
  SITE_URL,
  absoluteUrl,
} from "@/lib/seo";

const poppins = Poppins({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-poppins-family",
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  minimumScale: 1,
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  applicationName: SITE_NAME,
  title: {
    default: `${SITE_NAME} - Anime Tracker and Seasonal Anime Discovery`,
    template: `%s | ${SITE_NAME}`,
  },
  description: DEFAULT_DESCRIPTION,
  keywords: DEFAULT_KEYWORDS,
  alternates: {
    canonical: absoluteUrl("/"),
  },
  manifest: "/manifest.json",
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  category: "entertainment",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: "JaWtTN1_CBU0wc-SqB4fy9DTi0C4E1Sl_hGEEZnAfsE",
  },
  openGraph: {
    title: `${SITE_NAME} - Anime Tracker and Seasonal Anime Discovery`,
    description: DEFAULT_DESCRIPTION,
    url: absoluteUrl("/"),
    siteName: SITE_NAME,
    type: "website",
    images: [
      {
        url: absoluteUrl(OG_IMAGE_PATH),
        width: 512,
        height: 512,
        alt: `${SITE_NAME} app icon`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} - Anime Tracker and Seasonal Anime Discovery`,
    description: DEFAULT_DESCRIPTION,
    images: [absoluteUrl(OG_IMAGE_PATH)],
  },
  appleWebApp: {
    capable: true,
    title: SITE_NAME,
    startupImage: APPLE_STARTUP_IMAGES,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/search/{search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <html lang="en" className={poppins.variable}>
      <head>
        <link rel="llms" href="/llms.txt" type="text/markdown" />
        <link
          rel="alternate"
          href="/llms-full.txt"
          type="text/markdown"
          title={`${SITE_NAME} AI index`}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteJsonLd) }}
        />
      </head>
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <div data-app-router-root>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
