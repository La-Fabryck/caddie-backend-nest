import { parseSetCookie } from './http';

const MAX_AGE_SECONDS = 900;

describe('parseSetCookie', () => {
  it('reads the session attributes Nest writes', () => {
    const cookie = parseSetCookie(`SESSION_ID=a%2Bb; Path=/; Max-Age=${MAX_AGE_SECONDS}; HttpOnly; Secure; SameSite=Strict`);

    expect(cookie).toEqual({
      name: 'SESSION_ID',
      value: 'a+b',
      httpOnly: true,
      secure: true,
      path: '/',
      sameSite: 'Strict',
      maxAge: MAX_AGE_SECONDS,
    });
  });
});
