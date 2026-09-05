import { z } from 'zod';
import { zNotBlank } from '@/lib/zod/z-not-blank';
import { SUBSCRIBER_NAME } from '../messages/subscriber';

export const createSubcriberSchema = z.object({
  //TODO: Remove
  listId: z.uuid(),
  name: zNotBlank(SUBSCRIBER_NAME),
});
export type CreateSubcriberDto = z.infer<typeof createSubcriberSchema>;
