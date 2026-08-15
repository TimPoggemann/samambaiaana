import type { APIRoute } from 'astro';
import { Buffer } from 'node:buffer';
import type { Lang } from '../../i18n/ui';

/**
 * Booking request endpoint.
 *
 * Deliberately a plain form POST with a redirect back, no JavaScript required:
 * the form works with JS disabled, and a redirect means a refresh cannot
 * resubmit. Two independent instances of the form exist (homepage #book and
 * /flash's own copy), so this redirects back to wherever the request actually
 * came from (via Referer) rather than a single hardcoded page.
 *
 * The cardinal rule is that a genuine booking request is never silently
 * dropped. Anything that goes wrong sends the visitor back with a ?status=
 * that explains it, and a send failure shows the direct mailto address — so
 * the worst case is "write to us yourself" rather than a request that quietly
 * disappears. Every spam check below is therefore built to fail open: when it
 * cannot tell, it lets the request through.
 *
 * Nothing personal is ever put in the redirect URL. That costs the visitor
 * their typed text if the server rejects a submission, which is a fair trade:
 * the browser blocks almost all of those cases before they are sent, and an
 * email address in a query string ends up in logs and history.
 */

const RESEND_ENDPOINT = 'https://api.resend.com/emails';

/** Resend's shared sender. Only delivers to the address the account was registered with. */
const FALLBACK_FROM = 'Samambaia Ana Website <onboarding@resend.dev>';

// TODO: set as a Cloudflare Pages secret once the studio's real inbox is
// known — left empty on purpose so a missing CONTACT_TO fails loudly instead
// of silently delivering to a placeholder nobody reads.
const FALLBACK_TO = '';

const LIMITS = { name: 100, email: 200, city: 200, idea: 5000 } as const;
const MAX_REFERENCE_BYTES = 5 * 1024 * 1024;

/**
 * Nobody fills in this form in under three seconds; scripted submissions are
 * usually instant. Only a lower bound — an upper one would reject the visitor
 * who leaves the tab open overnight and comes back to finish, and losing a
 * real request is far worse than accepting a patient bot.
 */
const MIN_FILL_MS = 3000;

const SUSPICIOUS_LINK_COUNT = 3;
const URL_PATTERN = /\bhttps?:\/\/|\bwww\.|\[url[=\]]/gi;

// Deliberately loose. Real validation is delivery; this only rejects input that
// cannot possibly be an address, so a valid unusual one still gets through.
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

const field = (data: FormData, key: string) => {
  const value = data.get(key);
  return typeof value === 'string' ? value.trim() : '';
};

/**
 * Pulls the bare address out of a configured sender, which may be written
 * either as `Name <someone@example.com>` or as a plain address.
 */
const addressOf = (sender: string) => sender.match(/<([^>]+)>/)?.[1].trim() ?? sender.trim();

/**
 * The From display name carries the enquirer's own name, so the inbox lists
 * people rather than a run of identical rows, and a reply quotes them rather
 * than the studio appearing to quote itself.
 *
 * This is visitor-supplied text going into a mail header, so it is stripped of
 * everything that could break out of one: control characters and line breaks
 * first, since those are the header-injection vector, then quotes, backslashes
 * and angle brackets, which would otherwise close the quoted name early or open
 * a second address.
 */
function senderName(name: string): string {
  const cleaned = name
    .replace(/[\u0000-\u001f\u007f]+/g, ' ')
    .replace(/["<>\\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 60);

  return cleaned ? `${cleaned} (via samambaiaana.com)` : 'Pedido de agendamento samambaiaana.com';
}

/**
 * True when the form was submitted implausibly fast for someone who had to
 * type a name, an address and an idea.
 *
 * A missing or unreadable timestamp counts as human. It would only go missing
 * if the page markup and this route ever fell out of step during a deploy,
 * and in that window this check would swallow every real request without a
 * trace — exactly the failure this file exists to prevent.
 */
function submittedTooFast(raw: string): boolean {
  const startedAt = Number(raw);
  if (!raw || !Number.isFinite(startedAt) || startedAt <= 0) return false;
  return Date.now() - startedAt < MIN_FILL_MS;
}

/** Where to send the visitor back to — whichever page's form they actually submitted. */
function backPathFrom(request: Request): string {
  const referer = request.headers.get('referer');
  if (!referer) return '/';
  try {
    const refUrl = new URL(referer);
    const selfUrl = new URL(request.url);
    if (refUrl.origin !== selfUrl.origin) return '/';
    return refUrl.pathname || '/';
  } catch {
    return '/';
  }
}

export const POST: APIRoute = async ({ request, locals, redirect }) => {
  let lang: Lang = 'pt';
  const backPath = backPathFrom(request);

  // The fragment matters: without it the visitor lands at the top of a long
  // page and never sees the confirmation they just triggered.
  const back = (status: string) => redirect(`${backPath}?status=${status}#book`, 303);

  try {
    const data = await request.formData();
    lang = field(data, 'lang') === 'en' ? 'en' : 'pt';

    // Honeypot: a field no human sees, so anything in it is a bot. Answered
    // with the success page rather than an error — a bot told it was caught
    // just tries again differently.
    if (field(data, 'website')) return back('sent');
    if (submittedTooFast(field(data, 'started'))) return back('sent');

    // Over-length values can only come from a client that ignored the
    // maxlength attributes, i.e. not a browser, so trimming them costs no
    // real request.
    const name = field(data, 'name').slice(0, LIMITS.name);
    const email = field(data, 'email').slice(0, LIMITS.email);
    const city = field(data, 'city').slice(0, LIMITS.city);
    const idea = field(data, 'idea').slice(0, LIMITS.idea);

    if (!name || !idea || !EMAIL.test(email)) return back('invalid');

    const env = locals.runtime?.env;

    const apiKey = env?.RESEND_API_KEY ?? import.meta.env.RESEND_API_KEY;
    if (!apiKey) {
      console.error('[contact] RESEND_API_KEY is not set — request could not be sent');
      return back('error');
    }

    const to = env?.CONTACT_TO ?? import.meta.env.CONTACT_TO ?? FALLBACK_TO;
    if (!to) {
      console.error('[contact] CONTACT_TO is not set — no delivery inbox configured');
      return back('error');
    }

    const configuredFrom = env?.CONTACT_FROM ?? import.meta.env.CONTACT_FROM ?? FALLBACK_FROM;
    if (configuredFrom === FALLBACK_FROM) {
      console.warn('[contact] CONTACT_FROM is not set — sending from Resend\'s shared address, which only delivers to the Resend account owner');
    }

    // Only the address is taken from the configuration; the display name is
    // the enquirer's, so the inbox reads like a list of people rather than a
    // list of identical rows, and a reply quotes them by name.
    const from = `"${senderName(name)}" <${addressOf(configuredFrom)}>`;

    const links = idea.match(URL_PATTERN)?.length ?? 0;
    const flag = links >= SUSPICIOUS_LINK_COUNT ? '[Spam?] ' : '';
    const subject = `${flag}Pedido de agendamento via samambaiaana.com`;

    // The reference image is optional and best-effort: an unreadable or
    // oversized file skips the attachment rather than failing the whole
    // request — losing a photo the visitor can always re-send by email is a
    // much smaller failure than losing the booking request itself.
    const attachments: { filename: string; content: string }[] = [];
    const reference = data.get('reference');
    if (reference instanceof File && reference.size > 0) {
      if (reference.size > MAX_REFERENCE_BYTES) {
        console.warn(`[contact] reference image too large (${reference.size} bytes), skipping attachment`);
      } else if (!reference.type.startsWith('image/')) {
        console.warn(`[contact] reference upload has non-image type "${reference.type}", skipping attachment`);
      } else {
        try {
          const buf = await reference.arrayBuffer();
          attachments.push({
            filename: reference.name || 'reference.jpg',
            content: Buffer.from(buf).toString('base64'),
          });
        } catch (err) {
          console.warn('[contact] failed to read reference upload, skipping attachment', err);
        }
      }
    }

    const response = await fetch(RESEND_ENDPOINT, {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from,
        to: [to],
        // So hitting reply answers the enquirer, not the robot sender.
        reply_to: email,
        subject,
        text: [
          `Nome:     ${name}`,
          `E-mail:   ${email}`,
          city ? `Cidade:   ${city}` : null,
          `Idioma:   ${lang === 'en' ? 'Inglês' : 'Português'}`,
          '',
          idea,
        ].filter(Boolean).join('\n'),
        ...(attachments.length ? { attachments } : {}),
      }),
    });

    if (!response.ok) {
      console.error(`[contact] Resend rejected the send: ${response.status} ${await response.text()}`);
      return back('error');
    }

    return back('sent');
  } catch (error) {
    console.error('[contact] unexpected failure', error);
    return redirect(`${backPath}?status=error#book`, 303);
  }
};

/**
 * A GET here means someone followed the URL directly rather than submitting.
 * Send them back to the homepage instead of a bare 404.
 */
export const GET: APIRoute = ({ redirect }) => redirect('/#book', 303);
