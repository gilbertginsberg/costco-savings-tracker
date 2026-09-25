import type { Metadata } from "next";
import Script from "next/script";
import { Inter, Oswald } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { ADSENSE_CLIENT, MATOMO_SITE_ID, SITE_NAME, SITE_URL } from "@/lib/site";
import "./globals.css";

const inter = Inter({ variable: "--font-inter", subsets: ["latin"] });
const oswald = Oswald({ variable: "--font-oswald", subsets: ["latin"], weight: ["500", "600", "700"] });

const TITLE = "Costco Savings Tracker: This Month's Warehouse Deals, Searchable";
const DESCRIPTION =
  "Every deal from Costco's monthly Warehouse Savings, searchable and filterable by category, discount, and availability, plus an archive of past promo periods. From Kirkland Corner.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: TITLE, template: `%s | ${SITE_NAME}` },
  description: DESCRIPTION,
  keywords: [
    "costco warehouse savings",
    "costco monthly deals",
    "costco coupon book",
    "costco deals this month",
    "costco savings search",
  ],
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: SITE_URL,
    siteName: SITE_NAME,
    type: "website",
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
  alternates: { canonical: "/" },
};

const matomoScript = (siteId: string) => `
  var _paq = window._paq = window._paq || [];
  _paq.push(['trackPageView']);
  _paq.push(['enableLinkTracking']);
  (function() {
    var u="https://geodework.matomo.cloud/";
    _paq.push(['setTrackerUrl', u+'matomo.php']);
    _paq.push(['setSiteId', ${JSON.stringify(siteId)}]);
    var d=document, g=d.createElement('script'), s=d.getElementsByTagName('script')[0];
    g.async=true; g.src='https://cdn.matomo.cloud/geodework.matomo.cloud/matomo.js'; s.parentNode.insertBefore(g,s);
  })();
`;

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${inter.variable} ${oswald.variable} h-full antialiased`}>
      <head>
        {MATOMO_SITE_ID ? (
          <script id="matomo-analytics" dangerouslySetInnerHTML={{ __html: matomoScript(MATOMO_SITE_ID) }} />
        ) : null}
      </head>
      <body className="flex min-h-full flex-col bg-kc-bg text-kc-ink">
        {ADSENSE_CLIENT ? (
          <Script
            id="adsense"
            async
            strategy="afterInteractive"
            crossOrigin="anonymous"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
          />
        ) : null}
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
