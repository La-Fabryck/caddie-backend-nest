import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { type User } from '@prisma/client';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { CreateItemDto } from '../dto/create-item.dto';
import { UpdateItemDto } from '../dto/update-item.dto';
import { ItemService } from './item.service';

@Controller('/list/:listId/items')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post()
  async create(@Param('listId', ParseUUIDPipe) listId: string, @Body() createItemDto: CreateItemDto, @CurrentUser() user: User) {
    return this.itemService.create({
      createItemPayload: { listId, name: createItemDto.name },
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  async findAll(@Param('listId', ParseUUIDPipe) listId: string, @CurrentUser() user: User) {
    return this.itemService.findAllByListId({ listId, user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get(':itemId')
  async findOne(@Param('listId', ParseUUIDPipe) listId: string, @Param('itemId', ParseUUIDPipe) itemId: string, @CurrentUser() user: User) {
    return this.itemService.findOne({ itemId, listId, user });
  }

  // eslint-disable-next-line max-params
  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Patch(':itemId')
  async update(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Param('itemId', ParseUUIDPipe) itemId: string,
    @Body() updateShoppingDto: UpdateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemService.update({
      // eslint-disable-next-line @typescript-eslint/no-misused-spread
      updateItemPayload: { ...updateShoppingDto, listId, id: itemId },
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Delete(':itemId')
  async remove(@Param('listId', ParseUUIDPipe) listId: string, @Param('itemId', ParseUUIDPipe) itemId: string, @CurrentUser() user: User) {
    await this.itemService.remove(listId, itemId, user);
  }
}
