import { Injectable, NotFoundException, NotImplementedException, UnprocessableEntityException } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import type { UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import type { CreateUserDto } from '../dto/create-user.dto';
import type { UpdateUserDto } from '../dto/update-user.dto';
import { USER_EMAIL_NOT_UNIQUE } from '../messages/user';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<UserRow> {
    const existing = await this.findOneByEmail(createUserDto.email);
    if (existing != null) {
      throw new UnprocessableEntityException({
        email: [{ message: USER_EMAIL_NOT_UNIQUE }],
      });
    }

    const salt = await genSalt();
    const password = await hash(createUserDto.password, salt);

    const row = await this.database
      .insertInto('User')
      .values({
        name: createUserDto.name,
        email: createUserDto.email.toLowerCase(),
        password,
      })
      .returningAll()
      .executeTakeFirstOrThrow();

    return row;
  }

  async findOneByEmail(email: string): Promise<UserRow | null> {
    const user = await this.database
      .selectFrom('User')
      .where((eb) => eb(eb.fn('lower', [eb.ref('email')]), '=', eb.fn('lower', [eb.val(email)])))
      .selectAll()
      .executeTakeFirst();

    return user ?? null;
  }

  async findOneById(id: string): Promise<UserRow | null> {
    const user = await this.database.selectFrom('User').where('id', '=', id).selectAll().executeTakeFirst();
    return user ?? null;
  }

  async findOne(id: string): Promise<UserRow> {
    const user = await this.findOneById(id);

    if (user == null) {
      throw new NotFoundException();
    }

    return user;
  }

  //TODO: Implement
  update(_id: string, _updateUserDto: UpdateUserDto): never {
    throw new NotImplementedException();
  }

  async remove(id: string): Promise<void> {
    await this.database.deleteFrom('Subscriber').where('userId', '=', id).execute();
    await this.database.deleteFrom('User').where('id', '=', id).execute();
  }
}
