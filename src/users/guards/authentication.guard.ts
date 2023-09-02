import { FastifyRequest } from 'fastify';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { JwtPayload } from '../authentication/authentication.service';

@Injectable()
export class AuthenticationGuard implements CanActivate {
  constructor(private jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request: FastifyRequest = context.switchToHttp().getRequest();
    //TODO: extract to conf
    const token = this.extractFromCookie(request, 'SESSION_ID');

    if (token == null) {
      throw new UnauthorizedException();
    }

    const payload = await this.jwtService.verifyAsync<JwtPayload>(token);

    request['userId'] = payload.sub;

    return true;
  }

  private extractFromCookie(
    req: FastifyRequest,
    cookieKey: string,
  ): string | null {
    return req.cookies[cookieKey] ?? null;
  }
}
