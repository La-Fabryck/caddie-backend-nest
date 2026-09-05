import { type CreateListDto, createListSchema } from './create-list.dto';

export const updateListSchema = createListSchema.partial().default({});
export type UpdateListDto = Partial<CreateListDto>;
