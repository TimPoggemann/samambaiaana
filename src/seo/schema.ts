/**
 * JSON-LD builders.
 *
 * Google reads these to understand *who* the site is about rather than
 * guessing from the copy. Everything is emitted as one `@graph` per page so
 * the nodes can reference each other by `@id` instead of repeating the
 * business on every page.
 *
 * TODO: street address is unknown (studio is by-appointment, home studio) —
 * left blank on purpose rather than guessed.
 */
import { SITE_NAME, SITE_URL } from './defaults';
import type { Lang } from '../i18n/ui';

/** Stable node ids. Referenced across pages, so they must not depend on the URL. */
const BUSINESS_ID = `${SITE_URL}/#business`;
const SITE_ID = `${SITE_URL}/#website`;

export interface TattooWork {
  title: string;
  image?: string | null;
  imageAlt?: string | null;
}

const abs = (path: string, origin: string) => new URL(path, origin).href;

/**
 * The two absolute URLs every builder below needs, derived once per page.
 * `Astro.site` is configured, but stays optional so this cannot throw in tests.
 */
export function pageContext(url: URL, site?: URL) {
  const origin = (site ?? new URL(SITE_URL)).origin;
  return { origin, pageUrl: new URL(url.pathname, origin).href };
}

/**
 * The studio. `TattooParlor` — schema.org's dedicated LocalBusiness subtype —
 * is what lets Google surface this as a local business result (map pin,
 * opening hours, reviews) rather than a generic page.
 */
export function business(origin: string) {
  return {
    '@type': 'TattooParlor',
    '@id': BUSINESS_ID,
    name: SITE_NAME,
    url: `${origin}/`,
    image: abs('/images/about-portrait.webp', origin),
    email: 'mailto:ssamambaiana@gmail.com',
    sameAs: ['https://instagram.com/samambaiaana'],
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'São Paulo',
      addressCountry: 'BR',
    },
  };
}

/** The site itself, so search results can show a sitelinks search box / site name. */
export function website(origin: string, lang: Lang) {
  return {
    '@type': 'WebSite',
    '@id': SITE_ID,
    url: `${origin}/`,
    name: SITE_NAME,
    inLanguage: lang === 'en' ? 'en' : 'pt-BR',
    publisher: { '@id': BUSINESS_ID },
  };
}

/**
 * One page. `type` narrows it where a more specific class exists — Google
 * treats ContactPage and AboutPage as distinct entities.
 */
export function webPage(
  origin: string,
  { url, name, description, type = 'WebPage', lang }:
    { url: string; name: string; description: string; type?: string; lang: Lang }
) {
  return {
    '@type': type,
    '@id': `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: lang === 'en' ? 'en' : 'pt-BR',
    isPartOf: { '@id': SITE_ID },
    about: { '@id': BUSINESS_ID },
    primaryImageOfPage: abs('/og-image.jpg', origin),
  };
}

/**
 * Trail for the breadcrumb line under a search result. Single level: the site
 * is flat, so every page hangs directly off the home page.
 */
export function breadcrumbs(origin: string, lang: Lang, page?: { name: string; url: string }) {
  const home = {
    '@type': 'ListItem',
    position: 1,
    name: lang === 'en' ? 'Home' : 'Início',
    item: `${origin}${lang === 'en' ? '/en/' : '/'}`,
  };
  return {
    '@type': 'BreadcrumbList',
    itemListElement: page
      ? [home, { '@type': 'ListItem', position: 2, name: page.name, item: page.url }]
      : [home],
  };
}

/**
 * The gallery, as an ordered list of tattoo photos. Gives each piece a name
 * and a real image in Google Images rather than leaving it an anonymous file.
 */
export function galleryList(origin: string, pageUrl: string, works: TattooWork[]) {
  const withImages = works.filter((w) => w.image);
  if (!withImages.length) return null;

  return {
    '@type': 'ItemList',
    '@id': `${pageUrl}#gallery`,
    itemListElement: withImages.map((work, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      item: {
        '@type': 'ImageObject',
        name: work.title,
        contentUrl: abs(work.image!, origin),
        creator: { '@id': BUSINESS_ID },
        ...(work.imageAlt ? { description: work.imageAlt } : {}),
      },
    })),
  };
}

/**
 * Serialise a page's nodes into the single @graph that goes in the head.
 *
 * The business and the website are prepended to every page rather than left
 * to the caller: `webPage`, `breadcrumbs` and `galleryList` all point at them
 * by @id, and a page that referenced an @id it never defined would be handing
 * Google a dangling pointer. Prepending here means that cannot happen, and
 * repeating two small nodes per page costs less than getting it wrong.
 */
export function graph(origin: string, lang: Lang, nodes: unknown[]) {
  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [business(origin), website(origin, lang), ...nodes].filter(Boolean),
  });
}
