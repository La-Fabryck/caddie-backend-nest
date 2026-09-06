import ms, { type StringValue } from 'ms';
import { z } from 'zod';

/**
 * Parses strings the same way `ms` / JWT `expiresIn` does. `StringValue` from `ms` is only a
 * compile-time union; this is the practical runtime check.
 */
function isMsDuration(value: string): value is StringValue {
  if (value.trim() === '') {
    return false;
  }
  /**
   * `ms` typings only accept `StringValue` (a template union). Config/env values are plain
   * `string`; this guard is the runtime check. Widen the parse overload once instead of
   * asserting each value is already a valid duration.
   */
  // oxlint-disable-next-line typescript/no-unsafe-type-assertion -- adapt ms StringValue input to string for validation
  const parsed = ms(value as StringValue);
  return typeof parsed === 'number' && Number.isFinite(parsed);
}

export function zMsDuration() {
  return z.string().refine(isMsDuration, 'must be a duration string accepted by ms (e.g. 15m, 7d, 3600000)');
}

const MILLISECONDS_PER_SECOND = 1000;

/**
 * Turns an `ms` duration (`15m`, `14d`) into seconds.
 * JWT `expiresIn` and our TTL env vars use that string form; cookie `Max-Age` does not — it is
 * an integer number of seconds. `ms()` yields milliseconds, so this is the unit bridge.
 */
export function msDurationToSeconds(value: StringValue): number {
  return Math.floor(ms(value) / MILLISECONDS_PER_SECOND);
}
