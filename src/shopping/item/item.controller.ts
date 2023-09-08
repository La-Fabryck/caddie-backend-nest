import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateItemDto } from '../dto/update-item.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { ItemService } from './item.service';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { CurrentUser } from '@/users/decorators/current-user';

@Controller()
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post('/list/:listId/items')
  create(
    @Param('listId', ParseUUIDPipe) listId: string,
    @Body() createItemDto: CreateItemDto,
    @CurrentUser() user: User,
  ) {
    return this.itemService.create({
      createItemPayload: { listId, name: createItemDto.name },
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get('/list/:listId/items')
  findAll(
    @Param('listId', ParseUUIDPipe) listId: string,
    @CurrentUser() user: User,
  ) {
    return this.itemService.findAllByListId({ listId, user });
  }

  //TODO: protect
  @Get('items/:id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemService.findOne(id);
  }

  @Patch('items/:id')
  update(@Param('id') id: string, @Body() updateShoppingDto: UpdateItemDto) {
    return this.itemService.update(+id, updateShoppingDto);
  }

  @Delete('items/:id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}
