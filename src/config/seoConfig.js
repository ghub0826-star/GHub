// GHub SEO configuration
// APP_URL is read from env (VITE_APP_URL for Vite, REACT_APP_APP_URL for CRA).
// Fallback to a sensible default; never hardcode secrets here (none are).

const APP_URL = (typeof process !== 'undefined' && process.env && process.env.REACT_APP_APP_URL)
  || (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env.VITE_APP_URL)
  || 'https://domain-ghub.com';

const SITE_NAME = 'GHub';
const SITE_TITLE = 'GHub - Marketplace Game Aman untuk Item, Akun dan Top Up';
const SITE_DESCRIPTION =
  'Marketplace game modern untuk membeli dan menjual item, akun, currency, top up, dan layanan game dengan sistem transaksi aman.';
const DEFAULT_OG_IMAGE = `${APP_URL}/assets/site-bg.png`;
const DEFAULT_TWITTER_IMAGE = DEFAULT_OG_IMAGE;

const ORG_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: SITE_NAME,
  url: APP_URL,
  logo: DEFAULT_OG_IMAGE,
  sameAs: [],
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: SITE_NAME,
  url: APP_URL,
  potentialAction: {
    '@type': 'SearchAction',
    target: `${APP_URL}/marketplace?q={search_term_string}`,
    'query-input': 'required name=search_term_string',
  },
};

export {
  APP_URL,
  SITE_NAME,
  SITE_TITLE,
  SITE_DESCRIPTION,
  DEFAULT_OG_IMAGE,
  DEFAULT_TWITTER_IMAGE,
  ORG_SCHEMA,
  WEBSITE_SCHEMA,
};
