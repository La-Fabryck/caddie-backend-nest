import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
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
  async create(@Body() createShoppingDto: CreateListDto, @CurrentUser() user: User) {
    return this.listService.createList({
      title: createShoppingDto.title,
      pseudonym: createShoppingDto.pseudonym,
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  async findAllByAuthor(@CurrentUser() user: User) {
    return this.listService.findListsBySubscriber({ user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get(':id')
  async findOneById(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.listService.findOneById({ id, user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User, @Body() updateShoppingDto: UpdateListDto) {
    return this.listService.update({
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      payload: { ...updateShoppingDto, id },
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.listService.remove({ id, user });
  }
}
