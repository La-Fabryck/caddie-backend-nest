import { type CreateItemTypeDto, createItemTypeSchema } from './create-item-type.dto';

export const updateItemTypeSchema = createItemTypeSchema.partial().default({});
export type UpdateItemTypeDto = Partial<CreateItemTypeDto>;
