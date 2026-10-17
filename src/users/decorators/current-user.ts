import { createParamDecorator } from '@nestjs/common';
import type { UserRow } from '@/database/database-types';
import { authStorage } from '../authentication/auth-storage';

export const CurrentUser = createParamDecorator((): UserRow => {
  const user = authStorage.getStore()?.user;

  if (user == null) {
    throw new Error('Use CurrentUserInterceptor to fetch the user beforehand');
  }

  return user;
});
