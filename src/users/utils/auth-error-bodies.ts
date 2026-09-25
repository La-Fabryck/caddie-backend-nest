import type { ErrorInterface } from '@/app.configurator';
import { INVALID_LOGIN, INVALID_TOKEN } from '../messages/authentication';

const invalidLoginError: ErrorInterface = {
  root: [{ message: INVALID_LOGIN }],
};

const invalidTokenError: ErrorInterface = {
  root: [{ message: INVALID_TOKEN }],
};

export { invalidLoginError, invalidTokenError };
