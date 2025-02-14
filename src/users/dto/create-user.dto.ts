import { IsEmail, Matches, MinLength } from 'class-validator';
import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { USER_EMAIL, USER_NAME, USER_PASSWORD } from '../messages/user';
import { PASSWORD_REGEX } from '../utils/constants';

const USER_NAME_MIN_LENGTH = 2;

export class CreateUserDto {
  @IsEmail({}, { message: USER_EMAIL })
  email!: string;

  @IsNotBlank({ message: USER_NAME })
  @MinLength(USER_NAME_MIN_LENGTH, { message: USER_NAME })
  name!: string;

  @Matches(PASSWORD_REGEX, { message: USER_PASSWORD })
  password!: string;
}
