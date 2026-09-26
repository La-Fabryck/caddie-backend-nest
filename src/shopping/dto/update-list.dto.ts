import { z } from 'zod';
import { type CreateListDto, createListSchema } from './create-list.dto';

export const updateListSchema = createListSchema
  .partial()
  .extend({
    isArchived: z.boolean().optional(),
  })
  .default({});
export type UpdateListDto = Partial<CreateListDto> & { isArchived?: boolean };
