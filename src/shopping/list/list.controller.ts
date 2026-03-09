import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import type { UserRow } from '@/database/database-types';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';
import { ListService } from './list.service';

@Controller('list')
export class ListController {
  constructor(private readonly listService: ListService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post()
  async create(@Body() createListDto: CreateListDto, @CurrentUser() user: UserRow) {
    return this.listService.create({
      title: createListDto.title,
      pseudonym: createListDto.pseudonym,
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  async findAllByAuthor(@CurrentUser() user: UserRow) {
    return this.listService.findListsBySubscriber({ user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get(':id')
  async findOneById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow) {
    return this.listService.findOneById({ id, user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow, @Body() updateShoppingDto: UpdateListDto) {
    return this.listService.update({
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      payload: { ...updateShoppingDto, id },
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow) {
    return this.listService.remove({ id, user });
  }
}
