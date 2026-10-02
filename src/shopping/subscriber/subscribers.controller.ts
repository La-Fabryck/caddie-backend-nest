import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import type { SubscriberRow, UserRow } from '@/database/database-types';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { type JoinByShareLinkDto, joinByShareLinkSchema } from '../dto/join-by-share-link.dto';
import { type UpdateSubcriberDto, updateSubcriberSchema } from '../dto/update-subcriber.dto';
import { SubscribersService } from './subscribers.service';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post('join')
  async join(
    @Body({ schema: joinByShareLinkSchema }) joinByShareLinkDto: JoinByShareLinkDto,
    @CurrentUser() user: UserRow,
  ): Promise<SubscriberRow> {
    return this.subscribersService.joinByShareLink({ ...joinByShareLinkDto, user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  async findAll(@CurrentUser() user: UserRow): Promise<SubscriberRow[]> {
    return this.subscribersService.findAllByUser({ user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow): Promise<SubscriberRow> {
    return this.subscribersService.findOneById({ id, user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Patch(':id')
  update(@Param('id', ParseUUIDPipe) id: string, @Body({ schema: updateSubcriberSchema }) updateSubcriberDto: UpdateSubcriberDto): never {
    return this.subscribersService.update(id, updateSubcriberDto);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow): Promise<void> {
    return this.subscribersService.remove({ id, user });
  }
}
