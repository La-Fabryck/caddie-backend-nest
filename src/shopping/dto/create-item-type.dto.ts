import { z } from 'zod';
import { zNotBlank } from '@/lib/zod/z-not-blank';
import { ITEM_TYPE_LABEL } from '../messages/item-type';

export const createItemTypeSchema = z.object({
  label: zNotBlank(ITEM_TYPE_LABEL),
});
export type CreateItemTypeDto = z.infer<typeof createItemTypeSchema>;
