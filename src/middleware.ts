import { defineMiddleware } from 'astro:middleware';
import { ptOnlyPaths, localizePath, preferredLangFrom, type Lang } from './i18n/ui';

const LANG_COOKIE = 'lang';
const ONE_YEAR = 60 * 60 * 24 * 365;

/**
 * Never touch the CMS, the API routes or anything that looks like a file —
 * redirecting those would break Keystatic auth and the contact form POST.
 */
const SKIP = [/^\/api\//, /^\/keystatic/, /^\/_/, /\.[a-z0-9]+$/i];

/**
 * The CMS must stay out of the search index.
 *
 * A header is the fix that does not depend on a dashboard setting — Cloudflare
 * zones with the managed robots.txt (AI Crawl Control) on will answer
 * /robots.txt at the edge before the request ever reaches the site, and Pages
 * `_headers` files only apply to static assets, not the SSR worker. See
 * suleika-portfolio's middleware.ts for the verification that led here.
 */
const NO_INDEX = /^\/keystatic/;

/**
 * Return the response with X-Robots-Tag attached.
 *
 * Rebuilt rather than mutated in place: on Workers a Response can carry an
 * immutable header list depending on how the handler produced it, and
 * `headers.set()` throws there instead of being quietly ignored.
 */
function noIndex(response: Response): Response {
  const headers = new Headers(response.headers);
  headers.set('X-Robots-Tag', 'noindex, nofollow');
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers,
  });
}

/**
 * Search crawlers and link scrapers are served whatever URL they asked for.
 *
 * Google explicitly advises against redirecting on perceived language, and a
 * scraper following a redirect builds the link preview from the wrong
 * language — a Portuguese URL shared in WhatsApp would come back with an
 * English title. Matching on 'bot|crawl|spider' plus the named scrapers that
 * do not say "bot". A false positive here only means a human sees Portuguese
 * first, which is the default anyway — so the loose pattern fails safe.
 */
const CRAWLER =
  /bot|crawl|spider|slurp|search|lighthouse|facebookexternalhit|whatsapp|telegram|quora link preview|skypeuripreview|embedly|pinterest|vkshare|redditbot|flipboard|nuzzel|outbrain|xing-contenttabreceiver/i;

/**
 * The project's built-in *.pages.dev address can't be switched off without
 * deleting the project (which would take the custom domain down with it), so
 * it permanently forwards to the real domain instead. Only the production
 * alias — per-deployment preview URLs (<hash>.samambaiaana.pages.dev) stay
 * reachable for checking a build before it goes live.
 */
const PAGES_DEV_HOST = 'samambaiaana.pages.dev';
const CANONICAL_ORIGIN = 'https://samambaiaana.com';

export const onRequest = defineMiddleware(async (context, next) => {
  const { url, cookies, request } = context;
  const { pathname, search } = url;

  if (url.hostname === PAGES_DEV_HOST) {
    return Response.redirect(`${CANONICAL_ORIGIN}${pathname}${search}`, 301);
  }

  if (SKIP.some((re) => re.test(pathname))) {
    return NO_INDEX.test(pathname) ? noIndex(await next()) : next();
  }

  // An explicit ?lang= choice always wins: remember it, then bounce to the clean URL.
  const requested = url.searchParams.get('lang');
  if (requested === 'pt' || requested === 'en') {
    cookies.set(LANG_COOKIE, requested, {
      path: '/',
      maxAge: ONE_YEAR,
      sameSite: 'lax',
    });
    const params = new URLSearchParams(search);
    params.delete('lang');
    const rest = params.toString();
    const target = localizePath(stripPrefix(pathname), requested as Lang);
    return context.redirect(`${target}${rest ? `?${rest}` : ''}`, 302);
  }

  // Already on an English URL, or on a Portuguese-only legal page: leave it alone.
  if (pathname === '/en' || pathname.startsWith('/en/')) return next();
  if (ptOnlyPaths.includes(pathname)) return next();

  // Below here is guesswork from Accept-Language, which is exactly what a
  // crawler must not be subjected to. Anything above is an explicit signal and
  // still applies to everyone.
  if (CRAWLER.test(request.headers.get('user-agent') ?? '')) return next();

  const saved = cookies.get(LANG_COOKIE)?.value;

  // A saved Portuguese preference, or no English preference at all, stays put.
  if (saved === 'pt') return next();
  if (!saved && preferredLangFrom(request.headers.get('accept-language')) !== 'en') {
    return next();
  }

  return context.redirect(`${localizePath(pathname, 'en')}${search}`, 302);
});

function stripPrefix(pathname: string): string {
  if (pathname === '/en' || pathname === '/en/') return '/';
  return pathname.startsWith('/en/') ? pathname.slice(3) : pathname;
}
