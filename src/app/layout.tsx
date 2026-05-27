import type { Metadata, Viewport } from "next";
import { Poppins } from "next/font/google";
import "@/styles/globals.css";
import { APPLE_STARTUP_IMAGES } from "./apple-startup-images";
import Providers from "./providers";

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
  manifest: "/manifest.json",
  verification: {
    google: "JaWtTN1_CBU0wc-SqB4fy9DTi0C4E1Sl_hGEEZnAfsE",
  },
  appleWebApp: {
    startupImage: APPLE_STARTUP_IMAGES,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={poppins.variable}>
      <body className={`${poppins.className} antialiased`}>
        <Providers>
          <div data-app-router-root>{children}</div>
        </Providers>
      </body>
    </html>
  );
}
