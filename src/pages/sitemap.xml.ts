import type { APIRoute } from 'astro';
import { getEntry } from 'astro:content';
import { ptOnlyPaths, localizePath, sitePaths, type Lang } from '../i18n/ui';
import { isNoindexPath } from '../seo/defaults';

/**
 * Hand-rolled rather than @astrojs/sitemap: that integration emits its file at
 * build time from the pages it prerenders, and this site is `output: 'server'`
 * with nothing prerendered, so it would produce an empty sitemap.
 *
 * Every entry carries the full set of xhtml:link alternates (including a self
 * reference, which the spec requires) so Google pairs the Portuguese and
 * English versions instead of treating them as duplicates of each other.
 */
const FALLBACK_ORIGIN = 'https://samambaia-ana-tattoo.com';

const escape = (value: string) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const GET: APIRoute = async ({ site }) => {
  const origin = site?.origin ?? FALLBACK_ORIGIN;
  const abs = (path: string) => escape(new URL(path, origin).href);

  const seo = await getEntry('singletons', 'seo').catch(() => null);

  const urls = sitePaths.filter((path) => !isNoindexPath(seo?.data, path)).flatMap((path) => {
    const ptOnly = ptOnlyPaths.includes(path);

    // A Portuguese-only page has no alternate to declare, and hreflang pointing
    // only at itself is what Search Console reports as "no return tag".
    const alternates = ptOnly
      ? ''
      : (['pt', 'en'] as Lang[])
          .map((hreflang) => alternate(hreflang, abs(localizePath(path, hreflang))))
          .join('') + alternate('x-default', abs(path));

    const locales = ptOnly ? [path] : [path, localizePath(path, 'en')];

    return locales.map(
      (loc) => `  <url>
    <loc>${abs(loc)}</loc>${alternates}
    <changefreq>monthly</changefreq>
    <priority>${priorityFor(path, ptOnly)}</priority>
  </url>`
    );
  });

  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>
`,
    {
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Cache-Control': 'public, max-age=3600',
      },
    }
  );
};

const alternate = (hreflang: string, href: string) =>
  `\n    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;

/** The legal pages are required, not promoted — they sit below the real content. */
const priorityFor = (path: string, ptOnly: boolean) =>
  path === '/' ? '1.0' : ptOnly ? '0.3' : '0.8';
