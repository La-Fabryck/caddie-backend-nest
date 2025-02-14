import { IsNotBlank } from '@/lib/decorators/is-not-blank';

export class LoginDto {
  @IsNotBlank()
  email!: string;

  @IsNotBlank()
  password!: string;
}
