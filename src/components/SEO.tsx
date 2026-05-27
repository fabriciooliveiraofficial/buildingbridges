import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
  titleKey?: string; // Key in i18n translations under translation.seo
  descriptionKey?: string; // Key in i18n translations under translation.seo
  fallbackTitle?: string;
  fallbackDescription?: string;
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'organization';
  keywords?: string;
  schemaData?: object;
}

export const SEO: React.FC<SEOProps> = ({
  titleKey,
  descriptionKey,
  fallbackTitle,
  fallbackDescription,
  image = '/assets/logo_building_bridges.png',
  url = 'https://buildingbridgesbrusa.org',
  type = 'website',
  keywords,
  schemaData,
}) => {
  const { t, i18n } = useTranslation();

  // Determine localized title and description
  const pageTitle = titleKey ? t(`seo.${titleKey}`) : fallbackTitle || 'Building Bridges | Touching Nations, Changing Lives';
  const pageDescription = descriptionKey ? t(`seo.${descriptionKey}`) : fallbackDescription || 'Humanitarian foundation dedicated to bringing aid to families in need, disaster-stricken cities, and vulnerable individuals.';

  // Default Schema.org JSON-LD for Organization / NGO
  const defaultSchema = {
    '@context': 'https://schema.org',
    '@type': 'NGO',
    'name': 'Building Bridges Foundation',
    'alternateName': 'Building Bridges',
    'url': 'https://buildingbridgesbrusa.org',
    'logo': 'https://buildingbridgesbrusa.org/assets/logo_building_bridges.png',
    'slogan': 'Touching Nations, Changing Lives. Alcançando nações, tocando vidas.',
    'description': 'Humanitarian foundation dedicated to disaster relief and support for families in need, disaster-stricken cities, and vulnerable individuals.',
    'sameAs': [
      'https://www.facebook.com/buildingbridges',
      'https://www.instagram.com/buildingbridges'
    ],
    'address': {
      '@type': 'PostalAddress',
      'addressCountry': 'US'
    }
  };

  // Merge defaultSchema with custom schemaData if provided
  const activeSchema = schemaData ? { ...defaultSchema, ...schemaData } : defaultSchema;

  return (
    <Helmet>
      {/* HTML Language Attribute */}
      <html lang={i18n.language || 'en'} />

      {/* Standard Meta Tags */}
      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:image" content={image.startsWith('http') ? image : `https://buildingbridgesbrusa.org${image}`} />
      <meta property="og:url" content={url} />
      <meta property="og:site_name" content="Building Bridges Foundation" />

      {/* Twitter Cards */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={image.startsWith('http') ? image : `https://buildingbridgesbrusa.org${image}`} />

      {/* Verification for Google Search Console & Theme Colors */}
      <meta name="theme-color" content="#FF6B00" />
      <meta name="robots" content="index, follow" />

      {/* Schema.org JSON-LD structured data */}
      <script type="application/ld+json">
        {JSON.stringify(activeSchema)}
      </script>
    </Helmet>
  );
};
