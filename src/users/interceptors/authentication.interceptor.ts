import { type CallHandler, type ExecutionContext, Injectable, type NestInterceptor, UnauthorizedException } from '@nestjs/common';
import type { Observable } from 'rxjs';
import { authStorage } from '../authentication/auth-storage';
import { UsersService } from '../users/users.service';
import { invalidTokenError } from '../utils/auth-error-bodies';

@Injectable()
export class AuthenticationInterceptor implements NestInterceptor {
  constructor(private readonly usersService: UsersService) {}

  async intercept(_context: ExecutionContext, next: CallHandler): Promise<Observable<unknown>> {
    const store = authStorage.getStore();
    const userId = store?.userId;

    if (store != null && typeof userId === 'string') {
      const user = await this.usersService.findOneById(userId);
      if (user == null) {
        throw new UnauthorizedException(invalidTokenError);
      }
      store.user = user;
    }

    return next.handle();
  }
}
