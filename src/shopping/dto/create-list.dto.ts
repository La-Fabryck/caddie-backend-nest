import { z } from 'zod';
import { zNotBlank } from '@/lib/zod/z-not-blank';
import { LIST_PSEUDONYM, LIST_TITLE } from '../messages/list';

/** Matches `List.title` varchar(50). */
export const LIST_TITLE_MAX_LENGTH = 50;

export const createListSchema = z.object({
  title: zNotBlank(LIST_TITLE).max(LIST_TITLE_MAX_LENGTH, LIST_TITLE),
  pseudonym: zNotBlank(LIST_PSEUDONYM),
});
export type CreateListDto = z.infer<typeof createListSchema>;
