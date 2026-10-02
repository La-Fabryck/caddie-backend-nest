import type { ShareLinkRow } from '@/database/database-types';

export type ShareLinkResponse = Pick<ShareLinkRow, 'id' | 'token'>;

export class ShareLinkResponseDto {
  id!: string;
  token!: string;

  static fromRow(row: ShareLinkResponse): ShareLinkResponseDto {
    const dto = new ShareLinkResponseDto();
    dto.id = row.id;
    dto.token = row.token;
    return dto;
  }
}
