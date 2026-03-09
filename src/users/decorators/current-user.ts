import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { UserRow } from '@/database/database-types';

export const CurrentUser = createParamDecorator((_data: null, context: ExecutionContext): UserRow => {
  const request: FastifyRequest = context.switchToHttp().getRequest();

  if (request.user == null) {
    throw new Error('Use CurrentUserInterceptor to fetch the user beforehand');
  }

  return request.user;
});
