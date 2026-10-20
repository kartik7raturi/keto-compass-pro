/** Default wait (seconds) when the auth server doesn't tell us how long to wait. */
export const DEFAULT_RATE_LIMIT_SECONDS = 60;

export function isRateLimitError(error: { message?: string; status?: number; code?: string } | null | undefined): boolean {
  if (!error) return false;
  if (error.status === 429) return true;
  if (error.code === 'over_email_send_rate_limit' || error.code === 'over_request_rate_limit') return true;
  const msg = (error.message || '').toLowerCase();
  return msg.includes('rate limit') || msg.includes('too many requests');
}

/** Parses "For security purposes, you can only request this after 42 seconds." style messages. */
export function getRetryAfterSeconds(error: { message?: string } | null | undefined): number {
  const m = (error?.message || '').match(/after\s+(\d+)\s*second/i);
  if (m) return Math.max(1, parseInt(m[1], 10));
  return DEFAULT_RATE_LIMIT_SECONDS;
}
