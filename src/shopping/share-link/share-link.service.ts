import { randomBytes } from 'node:crypto';
import { Injectable, NotFoundException } from '@nestjs/common';
import type { UserRow } from '@/database/database-types';
import { DatabaseService } from '@/database/database.service';
import type { ShareLinkResponse } from '../dto/share-link-response.dto';
import { SubscribersService } from '../subscriber/subscribers.service';

const SHARE_TOKEN_BYTES = 32;
/** Default share-link lifetime in milliseconds (24h); tune later if needed. */
const SHARE_LINK_TTL_MS = 86_400_000;

@Injectable()
export class ShareLinkService {
  private static readonly TOKEN_BYTES = SHARE_TOKEN_BYTES;
  private static readonly TTL_MS = SHARE_LINK_TTL_MS;
  private static readonly RESPONSE_COLUMNS = ['id', 'token'] as const;

  constructor(
    private readonly database: DatabaseService,
    private readonly subscribersService: SubscribersService,
  ) {}

  async create({ listId, user }: { listId: string; user: UserRow }): Promise<ShareLinkResponse> {
    await this.subscribersService.findOne({ listId, user });

    return this.database
      .insertInto('ShareLink')
      .values({
        listId,
        token: randomBytes(ShareLinkService.TOKEN_BYTES).toString('base64url'),
        createdByUserId: user.id,
        expiresAt: new Date(Date.now() + ShareLinkService.TTL_MS),
      })
      .returning(ShareLinkService.RESPONSE_COLUMNS)
      .executeTakeFirstOrThrow();
  }

  async remove({ id, listId, user }: { id: string; listId: string; user: UserRow }): Promise<void> {
    await this.subscribersService.findOne({ listId, user });

    const deleted = await this.database
      .deleteFrom('ShareLink')
      .where('id', '=', id)
      .where('listId', '=', listId)
      .returning('id')
      .executeTakeFirst();

    if (deleted == null) {
      throw new NotFoundException();
    }
  }
}
