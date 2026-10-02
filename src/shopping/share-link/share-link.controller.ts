import { Controller, Delete, Param, ParseUUIDPipe, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import type { UserRow } from '@/database/database-types';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { ShareLinkResponseDto } from '../dto/share-link-response.dto';
import { ShareLinkService } from './share-link.service';

@Controller('list/:listId/share-links')
@UseGuards(AuthenticationGuard)
@UseInterceptors(AuthenticationInterceptor)
export class ShareLinkController {
  constructor(private readonly shareLinkService: ShareLinkService) {}

  @Post()
  async create(@Param('listId', ParseUUIDPipe) listId: string, @CurrentUser() user: UserRow): Promise<ShareLinkResponseDto> {
    const shareLink = await this.shareLinkService.create({ listId, user });
    return ShareLinkResponseDto.fromRow(shareLink);
  }

  @Delete(':id')
  async remove(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserRow,
  ): Promise<void> {
    return this.shareLinkService.remove({ id, listId, user });
  }
}
