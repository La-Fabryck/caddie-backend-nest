import type { Response } from 'supertest';

type ParsedSetCookie = {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
  path?: string;
  maxAge?: number;
};

function cookieHeader(cookies: Record<string, string>): string {
  return Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
}

function splitPair(value: string): [string, string] {
  const [key = '', ...rest] = value.split('=');
  return [key, rest.join('=')];
}

function decodeCookieValue(value: string): string {
  if (!value.includes('%')) {
    return value;
  }
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function applyCookieAttribute(cookie: ParsedSetCookie, attribute: string): void {
  const [rawKey, rawValue] = splitPair(attribute);
  const key = rawKey.toLowerCase();
  if (key === 'httponly') {
    cookie.httpOnly = true;
    return;
  }
  if (key === 'secure') {
    cookie.secure = true;
    return;
  }
  if (key === 'path') {
    cookie.path = rawValue;
    return;
  }
  if (key === 'samesite') {
    cookie.sameSite = rawValue;
    return;
  }
  if (key === 'max-age') {
    const maxAge = Number(rawValue);
    if (Number.isSafeInteger(maxAge)) {
      cookie.maxAge = maxAge;
    }
  }
}

/** One `Set-Cookie` header, in the shape the auth spec asserts. */
function parseSetCookie(header: string): ParsedSetCookie {
  const [pair, ...attributes] = header.split(';');
  const [name, rawValue] = splitPair((pair ?? '').trim());
  const cookie: ParsedSetCookie = {
    name,
    value: decodeCookieValue(rawValue.trim()),
    httpOnly: false,
    secure: false,
  };

  for (const attribute of attributes) {
    applyCookieAttribute(cookie, attribute.trim());
  }
  return cookie;
}

function setCookieValues(header: unknown): string[] {
  if (typeof header === 'string') {
    return [header];
  }
  if (!Array.isArray(header)) {
    return [];
  }

  const values: string[] = [];
  for (const value of header) {
    if (typeof value === 'string') {
      values.push(value);
    }
  }
  return values;
}

function setCookies(response: Response): ParsedSetCookie[] {
  return setCookieValues(response.headers['set-cookie']).map((value) => parseSetCookie(value));
}

export { cookieHeader, parseSetCookie, setCookies };
