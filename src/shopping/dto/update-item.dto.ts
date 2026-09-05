import { z } from 'zod';
import { type CreateItemDto, createItemSchema } from './create-item.dto';

export const updateItemSchema = createItemSchema
  .partial()
  .extend({
    isInCart: z.boolean().optional(),
  })
  .default({});
export type UpdateItemDto = Partial<CreateItemDto> & { isInCart?: boolean };
