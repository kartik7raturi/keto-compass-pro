import { describe, it, expect } from 'vitest';
import { isRateLimitError, getRetryAfterSeconds } from './authRateLimit';

describe('auth rate limit', () => {
  it('detects the "email rate limit exceeded" error', () => {
    expect(isRateLimitError({ message: 'email rate limit exceeded' })).toBe(true);
  });
  it('detects HTTP 429', () => {
    expect(isRateLimitError({ message: 'x', status: 429 })).toBe(true);
  });
  it('ignores other errors', () => {
    expect(isRateLimitError({ message: 'Invalid email', status: 400 })).toBe(false);
  });
  it('reads the wait time from the server message', () => {
    expect(getRetryAfterSeconds({ message: 'you can only request this after 42 seconds.' })).toBe(42);
  });
  it('falls back to 60 seconds', () => {
    expect(getRetryAfterSeconds({ message: 'email rate limit exceeded' })).toBe(60);
  });
});
