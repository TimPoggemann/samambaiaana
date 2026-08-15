/**
 * Titles and meta descriptions, in one place.
 *
 * These are the *defaults* — every one of them is overridable in Keystatic
 * ("SEO / Meta"), and keystatic.config.ts imports this file so the CMS field
 * defaults and the runtime fallbacks can never drift apart.
 *
 * TODO: SITE_URL is a placeholder — replace with the real domain once
 * registered (see astro.config.mjs `site`, which must match).
 */
import type { Lang } from '../i18n/ui';

export const SITE_NAME = 'Samambaia Ana';
export const SITE_URL = 'https://samambaiaana.com';

/** The pages that carry editable SEO copy. Legal pages are excluded on purpose. */
export type SeoPage = 'homepage' | 'flash';

/**
 * Portuguese. Also the `defaultValue` of every field in the Keystatic SEO
 * singleton, so an untouched CMS shows exactly what the site is already
 * serving.
 *
 * Titles: keep under ~60 characters, keywords first — Google truncates beyond
 * that and the title is a genuine ranking signal. `SITE_NAME` is appended
 * automatically unless the title already contains it, which is why only the
 * homepage spells it out.
 */
export const SEO_DEFAULTS = {
  homepageTitle: 'Samambaia Ana — Tatuagem Fine-Line & Ornamental',
  homepageDescription:
    'Tatuagens ornamentais de traço fino e freehand por Ana Beatriz — botânicas, figurativas, místicas. Estúdio em São Paulo, Eurotour 2026.',

  flashTitle: 'Flash Designs — Samambaia Ana',
  flashDescription:
    'Todos os flashes disponíveis da Samambaia Ana — prontos para tatuar como estão, ou como ponto de partida para sua ideia.',
} as const;

/**
 * English. Separate from the Portuguese set rather than routed through
 * `localized()` because that helper falls back to Portuguese — acceptable for
 * body copy the reader can skim past, wrong for a title tag, where it would
 * put Portuguese text on an English search result.
 */
export const SEO_DEFAULTS_EN = {
  homepageTitle: 'Samambaia Ana — Fine-Line & Ornamental Tattoo',
  homepageDescription:
    'Fine-line and freehand ornamental tattoos by Ana Beatriz — botanical, figurative, mystical. São Paulo studio, 2026 Eurotour.',

  flashTitle: 'Flash Designs — Samambaia Ana',
  flashDescription:
    'Every available flash design from Samambaia Ana — ready to tattoo as is, or as a starting point for your own idea.',
} as const;

const nonEmpty = (value: unknown): string | null =>
  typeof value === 'string' && value.trim() !== '' ? value : null;

/** Which SEO page's CMS fields govern a given Portuguese-rooted route. */
export const SEO_PAGE_BY_PATH: Record<string, SeoPage> = {
  '/': 'homepage',
  '/flash': 'flash',
};

export interface PageSeo {
  title: string;
  description: string;
  /** Falls back to `title` when no override is set. */
  ogTitle: string;
  /** Falls back to `description` when no override is set. */
  ogDescription: string;
  /** Absolute-from-root path to a per-page card, or null for the site-wide one. */
  ogImage: string | null;
  /** Keeps the page off Google and out of the sitemap without deleting it. */
  noindex: boolean;
}

/**
 * Resolve everything the head needs for a page.
 *
 * Title and description: Portuguese reads CMS → Portuguese default. English
 * reads CMS (EN) → English default, and only then the Portuguese ones, so a
 * half-filled CMS degrades to a translated default rather than to Portuguese
 * text.
 *
 * The social overrides work differently on purpose. They have no defaults —
 * empty means "use the SEO title/description", which is the right answer
 * almost always and keeps the client from having to fill in twice as many
 * boxes. An English override falls back to the Portuguese override before
 * falling back to the SEO field, matching how every other `(EN)` field on the
 * site behaves.
 */
export function resolveSeo(
  seoData: Record<string, unknown> | undefined | null,
  lang: Lang,
  page: SeoPage
): PageSeo {
  const pageData = (seoData?.[page] ?? {}) as Record<string, unknown>;

  const pick = (kind: 'Title' | 'Description') => {
    const key = kind === 'Title' ? 'title' : 'description';
    const pt = nonEmpty(pageData[key]) ?? SEO_DEFAULTS[`${page}${kind}`];
    if (lang !== 'en') return pt;
    return nonEmpty(pageData[`${key}En`]) ?? SEO_DEFAULTS_EN[`${page}${kind}`];
  };

  const pickOverride = (key: 'ogTitle' | 'ogDescription') => {
    const pt = nonEmpty(pageData[key]);
    if (lang !== 'en') return pt;
    return nonEmpty(pageData[`${key}En`]) ?? pt;
  };

  const title = pick('Title');
  const description = pick('Description');

  return {
    title,
    description,
    ogTitle: pickOverride('ogTitle') ?? title,
    ogDescription: pickOverride('ogDescription') ?? description,
    ogImage: nonEmpty(pageData.ogImage),
    noindex: pageData.noindex === true,
  };
}

/**
 * Whether a route has been pulled from the index in the CMS. Used by the
 * sitemap, which only knows paths — a page marked noindex is dropped from it
 * entirely, because listing a URL you are also telling Google to ignore is a
 * contradiction Search Console reports as an error.
 */
export function isNoindexPath(
  seoData: Record<string, unknown> | undefined | null,
  path: string
): boolean {
  const page = SEO_PAGE_BY_PATH[path];
  if (!page) return false;
  const pageData = seoData?.[page] as Record<string, unknown> | undefined;
  return pageData?.noindex === true;
}
