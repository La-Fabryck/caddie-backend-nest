import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UpdateItemDto } from '../dto/update-item.dto';
import { CreateItemDto } from '../dto/create-item.dto';
import { ItemService } from './item.service';

@Controller('item')
export class ItemController {
  constructor(private readonly itemService: ItemService) {}

  @Post()
  create(@Body() createItemDto: CreateItemDto) {
    return this.itemService.create(createItemDto);
  }

  //TODO: find by user authenticated
  @Get()
  findAll(@Query('listId', ParseUUIDPipe) authorId: string) {
    return this.itemService.findAll(authorId);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.itemService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShoppingDto: UpdateItemDto) {
    return this.itemService.update(+id, updateShoppingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemService.remove(+id);
  }
}
