import { createParamDecorator, type ExecutionContext } from '@nestjs/common';
import { type User } from '@prisma/client';
import { type FastifyRequest } from 'fastify';

export const CurrentUser = createParamDecorator((_data: null, context: ExecutionContext): User => {
  const request: FastifyRequest = context.switchToHttp().getRequest();

  if (request.user == null) {
    throw new Error('Use CurrentUserInterceptor to fetch the user beforehand');
  }

  return request.user;
});
