import { ForbiddenException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare } from 'bcrypt';
import { LoginDto } from '../dto/login.dto';
import { INVALID_LOGIN } from '../messages/authentication';
import { UsersService } from '../users/users.service';
import { ErrorInterface } from '@/app.configurator';

export type JwtPayload = { sub: string };

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  //TODO: message key
  private defaultError: ErrorInterface = {
    root: [{ message: INVALID_LOGIN }],
  };

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (user == null) {
      throw new ForbiddenException(this.defaultError);
    }

    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException(this.defaultError);
    }

    const payload = { sub: user.id };
    //TODO: remove expires in, add refresh TOKEN
    return this.jwtService.signAsync(payload, { expiresIn: '60d' });
  }
}
