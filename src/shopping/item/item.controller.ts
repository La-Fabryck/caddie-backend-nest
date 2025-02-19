import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemService } from './item.service';

@Controller()
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post('/list/:listId/items')
  async create(@Param('listId', ParseUUIDPipe) listId: string, @Body() createItemDto: CreateItemDto, @CurrentUser() user: User) {
    return this.itemService.create({
      createItemPayload: { listId, name: createItemDto.name },
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get('/list/:listId/items')
  async findAll(@Param('listId', ParseUUIDPipe) listId: string, @CurrentUser() user: User) {
    return this.itemService.findAllByListId({ listId, user });
  }

  //TODO: protect
  @Get('items/:id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemService.findOne(id);
  }

  // eslint-disable-next-line max-params
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Patch('/list/:listId/items/:itemId')
  async update(
    @Param('listId') listId: string,
    @Param('itemId') itemId: string,
    @Body() updateShoppingDto: UpdateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemService.update({
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      updateItemPayload: { ...updateShoppingDto, listId, id: itemId },
      user,
    });
  }

  @Delete('items/:id')
  remove(@Param('id') id: string) {
    this.itemService.remove(id);
  }
}
