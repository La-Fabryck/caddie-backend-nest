import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '@prisma/client';
import { FastifyRequest } from 'fastify';

export const CurrentUser = createParamDecorator(
  (_data: null, ctx: ExecutionContext): User => {
    const req: FastifyRequest = ctx.switchToHttp().getRequest();

    if (req.user == null) {
      throw new Error(
        'Use CurrentUserInterceptor to fetch the user beforehand',
      );
    }

    return req.user;
  },
);
