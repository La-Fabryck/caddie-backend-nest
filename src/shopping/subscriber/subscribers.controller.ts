import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards, UseInterceptors } from '@nestjs/common';
import { User } from '@prisma/client';
import { CurrentUser } from '@/users/decorators/current-user';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { CreateSubcriberDto } from '../dto/create-subcriber.dto';
import { UpdateSubcriberDto } from '../dto/update-subcriber.dto';
import { SubscribersService } from './subscribers.service';

@Controller('subscribers')
export class SubscribersController {
  constructor(private readonly subscribersService: SubscribersService) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post()
  create(@Body() createSubcriberDto: CreateSubcriberDto, @CurrentUser() user: User) {
    return this.subscribersService.create({ ...createSubcriberDto, user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  findAll(@CurrentUser() user: User) {
    return this.subscribersService.findAllByUser({ user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string, @CurrentUser() user: User) {
    return this.subscribersService.findOneById({ id, user });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSubcriberDto: UpdateSubcriberDto) {
    return this.subscribersService.update(+id, updateSubcriberDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.subscribersService.remove(+id);
  }
}
