import { ForbiddenException, Injectable, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { type User } from '@prisma/client';
import { genSalt, hash } from 'bcrypt';
import { DatabaseService } from '@/database/database.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.database.user.count({
      where: {
        email: {
          equals: createUserDto.email,
          mode: 'insensitive',
        },
      },
    });

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
  update(_id: string, _updateUserDto: UpdateUserDto) {
    throw new NotImplementedException();
  }

  async remove(id: string) {
    await this.database.subscriber.deleteMany({
      where: {
        userId: id,
      },
    });

    await this.database.user.delete({
      where: {
        id,
      },
    });
  }
}
