import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor, UnauthorizedException } from '@nestjs/common';
import type { FastifyRequest } from 'fastify';
import type { Observable } from 'rxjs';
import { UsersService } from '../users/users.service';
import { invalidTokenError } from '../utils/auth-error-bodies';

@Injectable()
export class AuthenticationInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const { userId } = request;

    if (typeof userId === 'string') {
      const user = await this.usersService.findOneById(userId);
      if (user == null) {
        throw new UnauthorizedException(invalidTokenError);
      }
      request.user = user;
    }

    return next.handle();
  }
}
