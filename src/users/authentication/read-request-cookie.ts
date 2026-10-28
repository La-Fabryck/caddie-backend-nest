import { parse } from 'cookie';

type CookieHeader = string | string[] | undefined;

/**
 * First value for `name` in a `Cookie` header.
 * `cookie.parse` matches `@Cookies()`: first pair wins, percent-decoded.
 */
function readRequestCookie(header: CookieHeader, name: string): string | undefined {
  if (header == null) {
    return undefined;
  }

  const source = Array.isArray(header) ? header.join('; ') : header;
  return parse(source)[name];
}

export { readRequestCookie };
