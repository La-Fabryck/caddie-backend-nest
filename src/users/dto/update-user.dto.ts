import { type CreateUserDto, createUserSchema } from './create-user.dto';

export const updateUserSchema = createUserSchema.partial().default({});
export type UpdateUserDto = Partial<CreateUserDto>;
