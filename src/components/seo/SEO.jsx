import React from 'react';
import { Helmet } from 'react-helmet-async';
import { APP_URL, SITE_NAME, DEFAULT_OG_IMAGE, DEFAULT_TWITTER_IMAGE } from '../../config/seoConfig';

/**
 * Per-page SEO component.
 * Sets title, meta description, keywords, canonical, robots, Open Graph,
 * Twitter Card, and optional structured data (JSON-LD).
 *
 * Usage:
 *   <SEO title="..." description="..." canonical="/path" image="..." />
 *   <SEO jsonLd={[ {...}, {...} ]} />
 */
export default function SEO({
  title,
  description,
  keywords,
  canonical,
  robots = 'index,follow',
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  jsonLd = [],
}) {
  const fullTitle = title || `${SITE_NAME} - Marketplace Game Aman`;
  const siteUrl = APP_URL;
  const canonicalUrl = canonical ? `${siteUrl}${canonical}` : siteUrl;
  const ogImage = image || DEFAULT_OG_IMAGE;
  const twitterImage = image || DEFAULT_TWITTER_IMAGE;
  const optRobots = noindex ? 'noindex,nofollow' : robots;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description || ''} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={canonicalUrl} />
      <meta name="robots" content={optRobots} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description || ''} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />

      {/* Twitter / X Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description || ''} />
      <meta name="twitter:image" content={twitterImage} />

      {/* Structured Data (JSON-LD) */}
      {jsonLd.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
