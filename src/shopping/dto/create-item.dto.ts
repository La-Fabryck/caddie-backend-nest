import { z } from 'zod';
import { zNotBlank } from '@/lib/zod/z-not-blank';
import { ITEM_NAME, ITEM_QUANTITY, ITEM_TYPE_ID } from '../messages/items';

const DEFAULT_ITEM_QUANTITY = 1;

export const createItemSchema = z.object({
  name: zNotBlank(ITEM_NAME),
  quantity: z.int(ITEM_QUANTITY).min(DEFAULT_ITEM_QUANTITY, ITEM_QUANTITY).optional(),
  itemTypeId: z.uuid(ITEM_TYPE_ID).optional(),
});
export type CreateItemDto = z.infer<typeof createItemSchema>;
