import { z } from 'zod';
import { zNotBlank } from '@/lib/zod/z-not-blank';
import { SHARE_LINK_TOKEN } from '../messages/share-link';
import { SUBSCRIBER_NAME } from '../messages/subscriber';

const joinByShareLinkSchema = z.object({
  token: zNotBlank(SHARE_LINK_TOKEN),
  name: zNotBlank(SUBSCRIBER_NAME),
});

type JoinByShareLinkDto = z.infer<typeof joinByShareLinkSchema>;

export { joinByShareLinkSchema, type JoinByShareLinkDto };
