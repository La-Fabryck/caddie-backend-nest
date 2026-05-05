/**
 * (?=.*[a-z])	The string must contain at least 1 lowercase alphabetical character
 * (?=.*[A-Z])	The string must contain at least 1 uppercase alphabetical character
 * (?=.*[\d])	The string must contain at least 1 numeric character
 * (?=.*[\W_])	The string must contain at least one special character (adding _)
 * (?=^.{12,30}$)	The string must be between 12 and 30 characters
 *
 * Inspired from : https://www.thepolyglotdeveloper.com/2015/05/use-regex-to-test-password-strength-in-javascript/
 *
 * RegExp cheatsheet : https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions/Cheatsheet
 */
export const PASSWORD_REGEX = /(?=.*[a-z])(?=.*[A-Z])(?=.*[\d])(?=.*[\W_])(?=^.{12,30}$)/;

/**
 * Environment variable names used by authentication.
 */
export const ACCESS_COOKIE_NAME = 'ACCESS_COOKIE_NAME';
export const REFRESH_COOKIE_NAME = 'REFRESH_COOKIE_NAME';
export const ACCESS_TOKEN_SECRET = 'ACCESS_TOKEN_SECRET';
export const ACCESS_TOKEN_TTL = 'ACCESS_TOKEN_TTL';
export const REFRESH_TOKEN_SECRET = 'REFRESH_TOKEN_SECRET';
export const REFRESH_TOKEN_TTL = 'REFRESH_TOKEN_TTL';
