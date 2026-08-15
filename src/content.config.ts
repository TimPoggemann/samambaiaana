import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * Exactly 8 slots (order 0-7). The mosaic grid layout (span/rotation/offset
 * per position, both desktop and mobile) is a hand-tuned design decision fixed
 * in code — see PORTFOLIO_LAYOUT / MOBILE_PORTFOLIO_LAYOUT in index.astro —
 * so the CMS only ever swaps which photo sits in which of the 8 fixed slots.
 * Slot 7 (order: 7) is also the scroll-zoom source image.
 */
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/portfolio' }),
  schema: z.object({
    label: z.string(),
    order: z.number(),
    image: z.string(),
    imageAlt: z.string().optional(),
    imageAltEn: z.string().optional(),
  }),
});

const flash = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/flash' }),
  schema: z.object({
    title: z.string(),
    titleEn: z.string().optional(),
    order: z.number().default(0),
    image: z.string(),
    status: z.enum(['available', 'reserved', 'taken']).optional(),
  }),
});

const testimonials = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/testimonials' }),
  schema: z.object({
    quote: z.string(),
    quoteEn: z.string().optional(),
    name: z.string(),
    order: z.number().default(0),
  }),
});

const faq = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/faq' }),
  schema: z.object({
    question: z.string(),
    questionEn: z.string().optional(),
    answer: z.string(),
    answerEn: z.string().optional(),
    order: z.number().default(0),
  }),
});

const otherWork = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/other-work' }),
  schema: z.object({
    label: z.string(),
    labelEn: z.string().optional(),
    image: z.string(),
    url: z.string(),
    order: z.number().default(0),
  }),
});

const singletons = defineCollection({
  loader: glob({ pattern: '**/*.json', base: 'src/content/singletons' }),
  schema: z.record(z.any()),
});

export const collections = { portfolio, flash, testimonials, faq, otherWork, singletons };
