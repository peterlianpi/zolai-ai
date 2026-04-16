/**
 * Maps a destination address (the address a user contacted) to the correct
 * "from" address to use when sending outbound email from that inbox.
 *
 * Resend requires the domain to be verified. All three addresses share the
 * same zolai.space domain so a single domain verification covers them all.
 */

const ADDRESS_MAP: Record<string, string> = {
  "hello@zolai.space":   "Zolai AI <hello@zolai.space>",
  "support@zolai.space": "Zolai Support <support@zolai.space>",
  "admin@zolai.space":   "Zolai Admin <admin@zolai.space>",
};

/**
 * Returns the formatted "from" address for a given inbox address.
 * Falls back to RESEND_FROM_EMAIL / SMTP_FROM if the address is not mapped.
 */
export function fromAddressFor(address: string): string {
  return (
    ADDRESS_MAP[address.toLowerCase()] ||
    process.env.RESEND_FROM_EMAIL ||
    process.env.SMTP_FROM ||
    "Zolai AI <no-reply@zolai.space>"
  );
}
