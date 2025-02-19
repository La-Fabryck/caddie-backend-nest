import { ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { User } from '@prisma/client';
import { genSalt, hash } from 'bcrypt';
import { DatabaseService } from '@/database/database.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.countOneByEmail(createUserDto.email);

    if (userExists) {
      throw new ForbiddenException();
    }

    const salt = await genSalt();
    const password = await hash(createUserDto.password, salt);

    return this.database.user.create({
      data: {
        name: createUserDto.name,
        email: createUserDto.email.toLowerCase(),
        password,
      },
    });
  }

  async countOneByEmail(email: string): Promise<number> {
    return this.database.user.count({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.database.user.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });
  }

  //TODO: Implement
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  findAll() {
    return { toto: 'tutu' };
  }

  async findOne(id: string) {
    const user = await this.database.user.findUnique({
      where: {
        id,
      },
    });

    if (user == null) {
      throw new UnauthorizedException();
    }

    return user;
  }

  //TODO: Implement
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  update(id: string, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user ${updateUserDto.email}`;
  }

  //TODO: Implement
  // eslint-disable-next-line @typescript-eslint/class-methods-use-this
  remove(id: string) {
    return `This action removes a #${id} user`;
  }
}
