/// <reference types="astro/client" />

/**
 * Secrets set in the Cloudflare Pages dashboard (Settings → Variables and
 * Secrets). They are not build-time values, so they arrive on the request via
 * the adapter's runtime rather than through import.meta.env in production.
 */
interface CloudflareEnv {
  /** Resend API key. Without it the contact form cannot send — see src/pages/api/contact.ts. */
  RESEND_API_KEY?: string;
  /**
   * Sender address. Must be on a domain verified in Resend; falls back to
   * Resend's shared onboarding sender, which only delivers to the address the
   * Resend account itself was registered with.
   */
  CONTACT_FROM?: string;
  /** Where enquiries are delivered. */
  CONTACT_TO?: string;
}

type CloudflareRuntime = import('@astrojs/cloudflare').Runtime<CloudflareEnv>;

declare namespace App {
  interface Locals extends CloudflareRuntime {}
}
