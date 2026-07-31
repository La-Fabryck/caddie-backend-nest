/**
 * Turn a caught value / `Error.cause` into something useful in logs.
 * Avoids `[object Object]` from blind `String(...)` / template coercion.
 */
function formatErrorForLogInner(value: unknown, seen: WeakSet<object>): string {
  if (value instanceof Error) {
    if (seen.has(value)) {
      return '[Circular]';
    }
    seen.add(value);
    const base = `${value.name}: ${value.message}`;
    return value.cause === undefined ? base : `${base}; cause: ${formatErrorForLogInner(value.cause, seen)}`;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return String(value);
  }
  if (value == null) {
    return String(value);
  }
  if (typeof value === 'symbol') {
    return value.toString();
  }
  if (typeof value === 'function') {
    return `[Function ${value.name || 'anonymous'}]`;
  }
  try {
    return JSON.stringify(value);
  } catch {
    return Object.prototype.toString.call(value);
  }
}

export function formatErrorForLog(value: unknown): string {
  return formatErrorForLogInner(value, new WeakSet());
}
