import { IsNotBlank } from '@/lib/decorators/is-not-blank';
import { INVALID_EMAIL, INVALID_PASSWORD } from '../messages/authentication';

export class LoginDto {
  @IsNotBlank({ message: INVALID_EMAIL })
  email!: string;

  @IsNotBlank({ message: INVALID_PASSWORD })
  password!: string;
}
