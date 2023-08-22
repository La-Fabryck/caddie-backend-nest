import { IsEmail, IsString, Matches } from 'class-validator';
import { PASSWORD_REGEX } from '../utils/constants';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  name: string;

  @Matches(PASSWORD_REGEX)
  password: string;
}
