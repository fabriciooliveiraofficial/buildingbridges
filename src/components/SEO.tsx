import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';

// Canonical address of the site. Keep in sync with SITE_URL in server.js (which builds the tags crawlers see).
const SITE_URL = ((import.meta as any).env?.VITE_SITE_URL || 'https://buildingbridgesbrusa.org').replace(/\/+$/, '');
const DEFAULT_IMAGE = `${SITE_URL}/og-image.png`;
const DEFAULT_IMAGE_ALT = 'Building Bridges Foundation logo — Touching Nations, Changing Lives!';

const OG_LOCALES: Record<string, string> = { en: 'en_US', pt: 'pt_BR', es: 'es_MX' };
const HTML_LANGS: Record<string, string> = { en: 'en', pt: 'pt-BR', es: 'es-MX' };

interface SEOProps {
  titleKey?: string; // Key in i18n translations under translation.seo
  descriptionKey?: string; // Key in i18n translations under translation.seo
  fallbackTitle?: string;
  fallbackDescription?: string;
  image?: string; // absolute URL or site-relative path; data: URIs are ignored (not valid for link previews)
  type?: 'website' | 'article';
  keywords?: string;
  noindex?: boolean; // private / functional pages: keep them out of search results
  schemaData?: object; // optional page-specific JSON-LD (the organization data is static in index.html)
}

const toAbsolute = (src?: string) => {
  if (!src || src.startsWith('data:')) return undefined;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith('/') && !src.startsWith('//')) return `${SITE_URL}${src}`;
  return undefined;
};

export const SEO: React.FC<SEOProps> = ({
  titleKey,
  descriptionKey,
  fallbackTitle,
  fallbackDescription,
  image,
  type = 'website',
  keywords,
  noindex = false,
  schemaData,
}) => {
  const { t, i18n } = useTranslation();
  const { pathname } = useLocation();

  // The tags rendered on the server (data-seo-ssr) are replaced by the ones below once the app is running,
  // so the page never carries two different titles/descriptions.
  useEffect(() => {
    const id = window.setTimeout(() => {
      document.head.querySelectorAll('[data-seo-ssr]').forEach((node) => node.remove());
    }, 150);
    return () => window.clearTimeout(id);
  }, []);

  const lang = (i18n.language || 'en').slice(0, 2);
  const pageTitle = titleKey ? t(`seo.${titleKey}.title`) : fallbackTitle || 'Building Bridges | Touching Nations, Changing Lives';
  const pageDescription = descriptionKey
    ? t(`seo.${descriptionKey}.description`)
    : fallbackDescription || t('seo.home.description');

  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const canonical = `${SITE_URL}${path}`;
  const imageUrl = toAbsolute(image) || DEFAULT_IMAGE;
  const usingDefaultImage = imageUrl === DEFAULT_IMAGE;
  const robots = noindex
    ? 'noindex, nofollow'
    : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

  return (
    <Helmet>
      <html lang={HTML_LANGS[lang] || 'en'} />

      <title>{pageTitle}</title>
      <meta name="description" content={pageDescription} />
      {keywords && <meta name="keywords" content={keywords} />}
      <meta name="robots" content={robots} />
      <link rel="canonical" href={canonical} />

      {/* Open Graph (Facebook, Instagram, WhatsApp, LinkedIn, Telegram...) */}
      <meta property="og:site_name" content="Building Bridges Foundation" />
      <meta property="og:type" content={type} />
      <meta property="og:title" content={pageTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:url" content={canonical} />
      <meta property="og:locale" content={OG_LOCALES[lang] || 'en_US'} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      <meta property="og:image:alt" content={usingDefaultImage ? DEFAULT_IMAGE_ALT : pageTitle} />
      {usingDefaultImage && <meta property="og:image:type" content="image/png" />}
      {usingDefaultImage && <meta property="og:image:width" content="1200" />}
      {usingDefaultImage && <meta property="og:image:height" content="630" />}

      {/* X / Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={pageTitle} />
      <meta name="twitter:description" content={pageDescription} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={usingDefaultImage ? DEFAULT_IMAGE_ALT : pageTitle} />

      {schemaData && <script type="application/ld+json">{JSON.stringify(schemaData)}</script>}
    </Helmet>
  );
};
