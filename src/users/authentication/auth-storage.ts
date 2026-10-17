import { AsyncLocalStorage } from 'node:async_hooks';
import type { UserRow } from '@/database/database-types';

type AuthStore = {
  userId?: string;
  user?: UserRow;
};

const authStorage = new AsyncLocalStorage<AuthStore>();

function authStorageMiddleware(_request: unknown, _response: unknown, next: () => void): void {
  authStorage.run({}, () => {
    next();
  });
}

export { authStorage, authStorageMiddleware };
