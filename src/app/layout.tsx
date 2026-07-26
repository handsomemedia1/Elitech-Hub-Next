import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import SmoothScroll from "@/components/SmoothScroll";
import InitialLoader from "@/components/InitialLoader";
import { FloatingChatbot, TrustBadge } from "@/components/FloatingWidgets";
import { PricingProvider } from "@/context/PricingContext";
import ScrollProgressBar from "@/components/ScrollProgressBar";
import ScrollNavbar from "@/components/ScrollNavbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrains = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

const SITE_URL = 'https://elitechub.com';
const SITE_NAME = 'Elitech Hub';
const DEFAULT_OG_IMAGE = `${SITE_URL}/images/og-default.jpg`;

export const metadata: Metadata = {
  // --- TITLE TEMPLATE: Every page title auto-appended with brand ---
  title: {
    default: `${SITE_NAME} | Nigeria's #1 AI Cybersecurity Training`,
    template: `%s | ${SITE_NAME}`,
  },
  description:
    "Elitech Hub is Nigeria's top-ranked cybersecurity training platform offering AI-powered bootcamps in Lagos, Abuja, and online. 100% internship guarantee.",
  keywords: [
    'cybersecurity training Nigeria',
    'ethical hacking course Lagos',
    'AI cybersecurity bootcamp Nigeria',
    'learn cybersecurity in Nigeria',
    'cybersecurity jobs Nigeria',
    'CompTIA Security Plus Nigeria',
    'CEH training Nigeria',
    'online cybersecurity course',
    'Elitech Hub',
    'cybersecurity internship Nigeria',
  ],
  // --- CANONICAL: prevents duplicate content penalties ---
  metadataBase: new URL(SITE_URL),
  alternates: {
    canonical: '/',
  },
  // --- OPEN GRAPH: controls every shared link preview ---
  openGraph: {
    type: 'website',
    locale: 'en_NG',
    url: SITE_URL,
    siteName: SITE_NAME,
    title: `${SITE_NAME} | Nigeria's #1 AI Cybersecurity Training`,
    description:
      "Join Nigeria's most intensive cybersecurity bootcamp. AI-powered curriculum, live hacking labs, and guaranteed unpaid internships for experience.",
    images: [
      {
        url: DEFAULT_OG_IMAGE,
        width: 1200,
        height: 630,
        alt: 'Elitech Hub — AI Cybersecurity Training in Nigeria',
      },
    ],
  },
  // --- TWITTER CARD: rich preview for Twitter / X shares ---
  twitter: {
    card: 'summary_large_image',
    title: `${SITE_NAME} | Nigeria's #1 AI Cybersecurity Training`,
    description:
      'Master ethical hacking, AI security, and get guaranteed internship experience.',
    images: [DEFAULT_OG_IMAGE],
  },
  // --- VERIFICATION: connect to Google Search Console, Bing etc. ---
  // verification: {
  //   google: 'YOUR_GOOGLE_SITE_VERIFICATION_CODE',
  //   other: { 'msvalidate.01': 'YOUR_BING_VERIFICATION_CODE' },
  // },
  // --- ROBOTS DIRECTIVE: maximum indexing permissions ---
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  // --- APP LINKS & MANIFEST ---
  manifest: '/manifest.json',
  icons: {
    icon: '/favicon.ico',
    apple: '/apple-touch-icon.png',
  },
};


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en-NG" className={`${inter.variable} ${jetbrains.variable}`} suppressHydrationWarning>
      <head>
        {/* === SCHEMA 1: Organization (Entity Graph) ===
            This tells Google/LLMs exactly WHO Elitech Hub is as an entity.
            The sameAs links tie us to verified external sources (crucial for AI trust). */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              '@id': 'https://elitechub.com/#organization',
              name: 'Elitech Hub',
              legalName: 'Elitech Hub',
              url: 'https://elitechub.com',
              logo: {
                '@type': 'ImageObject',
                url: 'https://elitechub.com/images/logo.png',
                width: 200,
                height: 60,
              },
              image: 'https://elitechub.com/images/og-default.jpg',
              description:
                "Nigeria's leading AI-powered cybersecurity training platform with a 100% internship guarantee.",
              foundingDate: '2023',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Lagos',
                addressRegion: 'Lagos State',
                addressCountry: 'NG',
              },
              contactPoint: [
                {
                  '@type': 'ContactPoint',
                  contactType: 'admissions',
                  availableLanguage: ['English'],
                },
              ],
              sameAs: [
                'https://twitter.com/ElitechHub',
                'https://www.linkedin.com/company/elitechhub',
                'https://www.instagram.com/elitechhub',
              ],
              knowsAbout: [
                'Cybersecurity',
                'Ethical Hacking',
                'AI Security',
                'Penetration Testing',
                'Network Security',
                'CompTIA Security+',
                'CEH Certification',
              ],
            }),
          }}
        />

        {/* === SCHEMA 2: LocalBusiness (ranks in local/maps searches) ===
            This is what gets you into Google Maps results and
            "cybersecurity training near me" / "in Lagos" queries. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'EducationalOrganization',
              '@id': 'https://elitechub.com/#localbusiness',
              name: 'Elitech Hub',
              url: 'https://elitechub.com',
              telephone: '',
              priceRange: '₦₦',
              image: 'https://elitechub.com/images/og-default.jpg',
              description:
                'Elitech Hub provides cybersecurity bootcamps and AI security training in Lagos, Nigeria, with guaranteed internship experience.',
              address: {
                '@type': 'PostalAddress',
                addressLocality: 'Lagos',
                addressRegion: 'Lagos State',
                postalCode: '100001',
                addressCountry: 'NG',
              },
              geo: {
                '@type': 'GeoCoordinates',
                latitude: 6.5244,
                longitude: 3.3792,
              },
              hasMap: 'https://maps.google.com/?q=Lagos,Nigeria',
              openingHoursSpecification: [
                {
                  '@type': 'OpeningHoursSpecification',
                  dayOfWeek: ['Saturday', 'Sunday'],
                  opens: '09:00',
                  closes: '18:00',
                },
              ],
              areaServed: [
                { '@type': 'City', name: 'Lagos' },
                { '@type': 'City', name: 'Abuja' },
                { '@type': 'City', name: 'Ibadan' },
                { '@type': 'State', name: 'Oyo State' },
                { '@type': 'Country', name: 'Nigeria' },
              ],
              hasOfferCatalog: {
                '@type': 'OfferCatalog',
                name: 'Cybersecurity Training Programs',
                itemListElement: [
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Course',
                      name: '6-Week AI Powered Cybersecurity Bootcamp',
                      url: 'https://elitechub.com/programs',
                    },
                  },
                  {
                    '@type': 'Offer',
                    itemOffered: {
                      '@type': 'Course',
                      name: '16-Week Professional Cybersecurity Program',
                      url: 'https://elitechub.com/programs',
                    },
                  },
                ],
              },
            }),
          }}
        />

        {/* === SCHEMA 3: WebSite with SearchAction (Sitelinks search box) ===
            This is what creates a search box directly inside Google results
            when someone searches for "Elitech Hub". */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              '@id': 'https://elitechub.com/#website',
              url: 'https://elitechub.com',
              name: 'Elitech Hub',
              description:
                "Nigeria's leading cybersecurity training platform.",
              publisher: {
                '@id': 'https://elitechub.com/#organization',
              },
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate:
                    'https://elitechub.com/blog?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />

        {/* Font Awesome */}
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css"
          crossOrigin="anonymous"
          referrerPolicy="no-referrer"
        />
      </head>
      <body suppressHydrationWarning>
        <ScrollProgressBar />
        <InitialLoader />
        <PricingProvider>
          <ScrollNavbar />
          <SmoothScroll>
            {children}
          </SmoothScroll>
          <FloatingChatbot />
          <TrustBadge />
        </PricingProvider>
      </body>
    </html>
  );
}
