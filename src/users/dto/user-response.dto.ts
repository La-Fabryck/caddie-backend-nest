import type { UserRow } from '@/database/database-types';

export class UserResponseDto {
  id!: string;
  email!: string;
  name!: string;

  static fromUser(user: UserRow): UserResponseDto {
    const dto = new UserResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    dto.name = user.name;
    return dto;
  }
}
