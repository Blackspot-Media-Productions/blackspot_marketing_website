import type { Metadata } from "next";
import Script from "next/script";
import { SmoothScroll } from "./components/SmoothScroll";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://theblackspotgroup.com"),
  title: "Blackspot — Brand, Media & Technology",
  description: "We diagnose the problem, then build the solution. Blackspot partners with growth-oriented businesses across the UK and South Africa.",
  icons: { icon: "/favicon.svg" },
  openGraph: {
    title: "Blackspot — We diagnose the problem, then build the solution.",
    description: "Brand, media and technology for ambitious businesses across the UK and South Africa.",
    images: [{ url: "/og.png", width: 1200, height: 630, alt: "Blackspot — We diagnose the problem, then build the solution." }],
  },
  twitter: { card: "summary_large_image", title: "Blackspot — Brand, Media & Technology", description: "We diagnose the problem, then build the solution.", images: ["/og.png"] },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <noscript>
          <style>{`.pageLoader{display:none!important}`}</style>
        </noscript>
        <Script id="intro-boot" strategy="beforeInteractive">{`
          (() => {
            try {
              if (location.pathname !== "/") return;
              if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
                document.documentElement.classList.add("loader-skip");
                return;
              }
              document.documentElement.classList.add("page-loading");
            } catch (e) {
              if (location.pathname === "/") document.documentElement.classList.add("page-loading");
            }
          })();
        `}</Script>
        <SmoothScroll>{children}</SmoothScroll>
      </body>
    </html>
  );
}
