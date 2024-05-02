import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { FastifyRequest } from 'fastify';
import { Observable } from 'rxjs';
import { UsersService } from '../users/users.service';

@Injectable()
export class AuthenticationInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  async intercept(context: ExecutionContext, next: CallHandler): Promise<Observable<any>> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    const { userId } = request || {};

    if (userId) {
      request.user = await this.usersService.findOne(userId);
    }

    return next.handle();
  }
}
