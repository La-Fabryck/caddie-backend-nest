import { ForbiddenException, Injectable, NotImplementedException, UnauthorizedException } from '@nestjs/common';
import { genSalt, hash } from 'bcrypt';
import type { UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(private readonly database: DatabaseService) {}

  async create(createUserDto: CreateUserDto): Promise<UserRow> {
    const existing = await this.findOneByEmail(createUserDto.email);
    if (existing != null) {
      //FIXME: Should we return forbidden or bad request?
      throw new ForbiddenException();
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

  async findOne(id: string): Promise<UserRow> {
    const user = await this.database.selectFrom('User').where('id', '=', id).selectAll().executeTakeFirst();

    if (user == null) {
      throw new UnauthorizedException();
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
