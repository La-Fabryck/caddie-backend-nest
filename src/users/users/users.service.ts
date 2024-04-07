import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import { User } from '@prisma/client';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { DatabaseService } from '@/database/database.service';

@Injectable()
export class UsersService {
  constructor(private database: DatabaseService) {}

  async create(createUserDto: CreateUserDto) {
    const userExists = await this.countOneByEmail(createUserDto.email);

    if (userExists) {
      throw new ForbiddenException();
    }

    const salt = await genSalt();
    createUserDto.password = await hash(createUserDto.password, salt);

    return this.database.user.create({
      data: createUserDto,
    });
  }

  async countOneByEmail(email: string): Promise<number> {
    return this.database.user.count({
      where: {
        email,
      },
    });
  }

  async findOneByEmail(email: string): Promise<User | null> {
    return this.database.user.findUnique({
      where: {
        email,
      },
    });
  }

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
      throw new NotFoundException();
    }

    return user;
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user ${updateUserDto.email}`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
