import { z } from 'zod';

const DEFAULT_LIST_LIMIT = 10;
const MAX_LIST_LIMIT = 50;

const listPaginationSchema = z.object({
  limit: z.coerce.number().int().min(DEFAULT_LIST_LIMIT).max(MAX_LIST_LIMIT).default(DEFAULT_LIST_LIMIT),
  offset: z.coerce.number().int().min(0).default(0),
});
type ListPaginationDto = z.infer<typeof listPaginationSchema>;

export { DEFAULT_LIST_LIMIT, type ListPaginationDto, listPaginationSchema };
