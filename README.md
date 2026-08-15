# Samambaia Ana

Astro site for tattoo artist Ana Beatriz ("Samambaia Ana") — fine-line & ornamental tattoos, São Paulo studio + Eurotour. Single-page bilingual (PT/EN) marketing + booking site, built from a Claude Design handoff. Deployed on Cloudflare Pages, content edited live through Keystatic; every push to `main` (including a CMS save) triggers an automatic deploy.

## Quick start

```bash
cd samambaia-ana-tattoo
npm install
cp .env.example .env   # fill in RESEND_API_KEY etc. for the booking form
npm run dev
```

Dev server runs at http://localhost:4321.

## Stack

- [Astro](https://astro.build) 6 — SSR (`output: 'server'`)
- [Cloudflare Pages](https://pages.cloudflare.com) + Workers adapter
- [Keystatic](https://keystatic.com) (Cloud storage) — content CMS
- [React](https://react.dev) 19 — used sparingly, for Keystatic/Astro integration
- [Tailwind CSS](https://tailwindcss.com) 4 + hand-styled sections (matching the design handoff's inline-style-heavy prototype)
- [Resend](https://resend.com) — booking-form email delivery, including reference-image attachments

Same technical foundation (Keystatic, SEO, i18n architecture, image pipeline, contact-form hardening) as the sibling `suleika-portfolio` project, adapted from multi-page/DE-EN to single-page/PT-EN. See `CLAUDE.md` for the full architecture writeup.

## Content structure

Single page (`/` and `/en/`) built from Keystatic singletons (hero, about, where-to-find-me, booking, footer, SEO, privacy, terms) and collections (portfolio — 8 fixed mosaic slots, flash designs, testimonials, FAQ, other-work/shop links). A separate `/flash` (+ `/en/flash`) page shows the full flash gallery with a lightbox.

## Still open before this can go live

This was scaffolded and built out from a design handoff in one session — the code is real and tested (`npm run build` passes, verified in-browser desktop + mobile, PT + EN), but several things need real business information or external account setup that only the owner can provide:

- **Domain**: `astro.config.mjs` (`site`) and `src/seo/defaults.ts` (`SITE_URL`) use a placeholder `https://samambaiaana.com` — update both to the real domain once registered.
- **Keystatic Cloud project**: `keystatic.config.ts` has a placeholder `cloud.project` slug (`samambaia-ana-tattoo/samambaia-ana-tattoo`) — register the real project at [keystatic.cloud](https://keystatic.cloud) and update it, or Keystatic won't authenticate.
- **GitHub repo + Cloudflare Pages**: this is a local git repo only (`git init`, no commits yet, no remote). Needs a GitHub repo and a Cloudflare Pages project pointed at it (see `wrangler.toml` for the project name convention).
- **Resend / contact form env vars**: `RESEND_API_KEY`, `CONTACT_TO`, `CONTACT_FROM` — see `.env.example`. Nothing sends until these are set as Cloudflare Pages secrets (Production **and** Preview).
- **Privacy policy / terms of use**: `src/content/singletons/privacy.json` and `terms.json` are placeholder text. These need real LGPD-compliant copy (this is a Brazil-based business) before launch — not a legal review, just noting the placeholder needs replacing by someone qualified to write it.
- **Business details in JSON-LD**: `src/seo/schema.ts`'s `business()` has no street address (left blank rather than guessed) and no phone number.
- **Splash logo / favicon**: using the handoff's `hamsa-logo.webp` for both — no dedicated favicon-sized PNGs were in the handoff; the `<link rel="icon">` currently points straight at the webp logo, which works but isn't optimally sized.

## Known simplifications vs. the design handoff

The handoff (`design_handoff_ana_beatriz_landing/`) was a proprietary-runtime HTML/JS prototype, not directly portable. Everything was rebuilt natively in Astro/vanilla JS/CSS, matching colors, typography, copy, and layout precisely. Two things were deliberately simplified rather than ported 1:1:

- **Portfolio scroll-zoom effect**: ported with the same math (interpolates the last portfolio photo from its grid position to full-viewport as you scroll, ~1.1 viewport-heights), but desktop-only — on mobile the tile just displays normally, no zoom.
- **Flash gallery**: the handoff's "See all flashes" opened an in-page JS overlay (same URL). This is a real route (`/flash`) instead — same content and lightbox behavior, simpler and more robust (works with JS disabled up to the point of opening the lightbox, is a real shareable/indexable URL).

Full behavioral spec (including the parts above) is preserved in `design_handoff_ana_beatriz_landing/README.md` if anyone wants to compare against the original intent later.

## Status

Private client site, pre-launch. No public license.
