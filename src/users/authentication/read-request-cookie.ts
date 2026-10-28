//TODO: Look at `parse` from the `cookie` package. This read stays in the guard, because `@Cookies()` only binds route parameters.

type CookieHeader = string | string[] | undefined;

/**
 * First value for `name` in a `Cookie` header. Percent-decodes, matching `@Cookies()`.
 * Pair shape is `name=value` with optional surrounding spaces. First match wins.
 */
function readRequestCookie(header: CookieHeader, name: string): string | undefined {
  if (header == null) {
    return undefined;
  }

  const source = Array.isArray(header) ? header.join('; ') : header;
  const prefix = `${name}=`;
  for (const part of source.split(';')) {
    const token = part.trim();
    if (!token.startsWith(prefix)) {
      continue;
    }

    const raw = token.slice(prefix.length);
    try {
      return decodeURIComponent(raw);
    } catch {
      return raw;
    }
  }

  return undefined;
}

export { readRequestCookie };
