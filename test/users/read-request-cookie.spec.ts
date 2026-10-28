import { readRequestCookie } from '@/users/authentication/read-request-cookie';

describe('readRequestCookie', () => {
  it('returns the first value and percent-decodes it', () => {
    expect(readRequestCookie('SESSION_ID=a%2Bb; SESSION_ID=later; theme=dark', 'SESSION_ID')).toBe('a+b');
    expect(readRequestCookie('SESSION_ID=a%2Bb; SESSION_ID=later; theme=dark', 'theme')).toBe('dark');
  });

  it('ignores a missing header and pairs without a name', () => {
    expect(readRequestCookie(undefined, 'SESSION_ID')).toBeUndefined();
    expect(readRequestCookie('=nope; SESSION_ID=ok', 'SESSION_ID')).toBe('ok');
  });
});
