import type { Metadata } from 'next';
import Script from 'next/script';
import '@/app/globals.css'; // Make sure to import globals if not inherited correctly, but App router inherits root layout

export const metadata: Metadata = {
  title: 'Before Cybersecurity: What to Know Before Learning Cybersecurity',
  description: 'Understand what cybersecurity really involves, explore cybersecurity career paths, assess your starting point, and build a realistic learning roadmap before investing your time and money.',
  alternates: {
    canonical: 'https://www.elitechub.com/before-cybersecurity',
  },
  openGraph: {
    title: 'Before Cybersecurity — Understand What You\'re Starting',
    description: 'A practical cybersecurity orientation system for people who want to understand the field before investing months learning it.',
    url: 'https://www.elitechub.com/before-cybersecurity',
    images: [
      {
        url: 'https://www.elitechub.com/images/before-cybersecurity-og.jpg',
        width: 1200,
        height: 630,
        alt: 'Before Cybersecurity by Elitech-Hub',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Before Cybersecurity — Understand What You\'re Starting',
    description: 'A practical cybersecurity orientation system for people who want to understand the field before investing months learning it.',
    images: ['https://www.elitechub.com/images/before-cybersecurity-og.jpg'],
  },
};

export default function BeforeCybersecurityLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'Product',
        '@id': 'https://www.elitechub.com/before-cybersecurity/#product',
        name: 'Before Cybersecurity',
        description: 'A practical cybersecurity orientation system for people who want to understand the field before investing months learning it.',
        brand: {
          '@type': 'Brand',
          name: 'Elitech-Hub',
        },
        offers: {
          '@type': 'Offer',
          url: 'https://www.elitechub.com/before-cybersecurity',
          priceCurrency: 'NGN',
          price: '0', // Placeholder, will be dynamic in actual implementation
          availability: 'https://schema.org/InStock',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://www.elitechub.com/#organization',
        name: 'Elitech-Hub',
        url: 'https://www.elitechub.com',
      },
      {
        '@type': 'Person',
        '@id': 'https://www.elitechub.com/#founder',
        name: 'Elijah Adegboyega Adeyeye',
        jobTitle: 'Founder & Lead Instructor',
        worksFor: {
          '@id': 'https://www.elitechub.com/#organization',
        },
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: 'https://www.elitechub.com',
          },
          {
            '@type': 'ListItem',
            position: 2,
            name: 'Elitech-Hub',
            item: 'https://www.elitechub.com',
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: 'Before Cybersecurity',
            item: 'https://www.elitechub.com/before-cybersecurity',
          },
        ],
      },
    ],
  };

  return (
    <>
      <Script
        id="bc-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {children}
    </>
  );
}
