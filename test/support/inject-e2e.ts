import type { INestApplication } from '@nestjs/common';

type InjectOptions = {
  method: string;
  url: string;
  body?: unknown;
  cookies?: Record<string, string>;
};

type InjectedCookie = {
  name: string;
  value: string;
  httpOnly: boolean;
  secure: boolean;
  sameSite?: string;
  path?: string;
  maxAge?: number;
};

type InjectResult = {
  statusCode: number;
  payload: string;
  body: string;
  cookies: InjectedCookie[];
};

type E2EApplication = INestApplication & {
  inject: (options: InjectOptions) => Promise<InjectResult>;
};

type HeadersWithSetCookie = Headers & {
  getSetCookie: () => string[];
};

function hasGetSetCookie(headers: Headers): headers is HeadersWithSetCookie {
  return 'getSetCookie' in headers && typeof headers.getSetCookie === 'function';
}

function readSetCookies(headers: Headers): string[] {
  if (hasGetSetCookie(headers)) {
    return headers.getSetCookie();
  }
  throw new Error('fetch Headers.getSetCookie() is required to read session cookies');
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

function applyCookieAttribute(cookie: InjectedCookie, attribute: string): void {
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
function parseSetCookie(header: string): InjectedCookie {
  const [pair, ...attributes] = header.split(';');
  const [name, rawValue] = splitPair((pair ?? '').trim());
  const cookie: InjectedCookie = {
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

function cookieHeader(cookies: Record<string, string> | undefined): string | undefined {
  if (cookies == null) {
    return undefined;
  }
  const header = Object.entries(cookies)
    .map(([name, value]) => `${name}=${value}`)
    .join('; ');
  if (header.length === 0) {
    return undefined;
  }
  return header;
}

async function injectRequest(baseUrl: string, options: InjectOptions): Promise<InjectResult> {
  const headers = new Headers();
  const cookie = cookieHeader(options.cookies);
  if (cookie !== undefined) {
    headers.set('cookie', cookie);
  }

  const init: RequestInit = {
    method: options.method,
    headers,
  };
  if (options.body !== undefined) {
    headers.set('content-type', 'application/json');
    init.body = JSON.stringify(options.body);
  }

  const response = await fetch(new URL(options.url, baseUrl), init);
  const payload = await response.text();
  return {
    statusCode: response.status,
    payload,
    body: payload,
    cookies: readSetCookies(response.headers).map((header) => parseSetCookie(header)),
  };
}

export { type E2EApplication, type InjectOptions, type InjectResult, injectRequest, parseSetCookie };
