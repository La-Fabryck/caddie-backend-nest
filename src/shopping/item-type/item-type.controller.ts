import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import type { UserRow } from '@/database/database-types';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { CreateItemTypeDto } from '../dto/create-item-type.dto';
import { UpdateItemTypeDto } from '../dto/update-item-type.dto';
import { ItemTypeService } from './item-type.service';

@Controller('item-types')
export class ItemTypeController {
  constructor(private readonly itemTypeService: ItemTypeService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post()
  async create(@Body() createItemTypeDto: CreateItemTypeDto, @CurrentUser() user: UserRow) {
    return this.itemTypeService.create(createItemTypeDto, user);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  async findAll(@CurrentUser() user: UserRow) {
    return this.itemTypeService.findAllByUser(user);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Patch(':id')
  async update(@Param('id', ParseUUIDPipe) id: string, @Body() updateItemTypeDto: UpdateItemTypeDto, @CurrentUser() user: UserRow) {
    return this.itemTypeService.update(id, updateItemTypeDto, user);
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Delete(':id')
  async remove(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: UserRow) {
    await this.itemTypeService.remove(id, user);
  }
}
