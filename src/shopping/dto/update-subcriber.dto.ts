import { type CreateSubcriberDto, createSubcriberSchema } from './create-subcriber.dto';

export const updateSubcriberSchema = createSubcriberSchema.partial().default({});
export type UpdateSubcriberDto = Partial<CreateSubcriberDto>;
