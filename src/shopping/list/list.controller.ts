import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards, UseInterceptors } from '@nestjs/common';
import type { ListRow, UserRow } from '@/database/database-types';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { type CreateListDto, createListSchema } from '../dto/create-list.dto';
import { type ListPaginationDto, listPaginationSchema } from '../dto/list-pagination.dto';
import { type UpdateListDto, updateListSchema } from '../dto/update-list.dto';
import { ListService, type ListWithSubs } from './list.service';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post()
  async create(@Body({ schema: createListSchema }) createListDto: CreateListDto, @CurrentUser() user: UserRow): Promise<ListWithSubs> {
    return this.listService.create({
      title: createListDto.title,
      pseudonym: createListDto.pseudonym,
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  async findAllByAuthor(
    @CurrentUser() user: UserRow,
    @Query({ schema: listPaginationSchema }) pagination: ListPaginationDto,
  ): Promise<{ items: ListRow[]; total: number; limit: number; offset: number }> {
    return this.listService.findListsBySubscriber({ user, ...pagination });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get(':id')
  async findOneById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow): Promise<ListRow> {
    return this.listService.findOneById({ id, user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Patch(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: UserRow,
    @Body({ schema: updateListSchema }) updateShoppingDto: UpdateListDto,
  ): Promise<ListRow> {
    return this.listService.update({
      payload: { ...updateShoppingDto, id },
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow): Promise<void> {
    return this.listService.remove({ id, user });
  }
}
