import { ForbiddenException, Injectable } from '@nestjs/common';
import { compare } from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from '../dto/login.dto';
import { UsersService } from '../users/users.service';

export type JwtPayload = { sub: string };

@Injectable()
export class AuthenticationService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto): Promise<string> {
    const user = await this.usersService.findOneByEmail(loginDto.email);
    if (user == null) {
      throw new ForbiddenException();
    }

    const isPasswordValid = await compare(loginDto.password, user.password);
    if (!isPasswordValid) {
      throw new ForbiddenException();
    }

    const payload = { sub: user.id };
    return this.jwtService.signAsync(payload, { expiresIn: '60d' });
  }
}
