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
import { CreateListDto } from '../dto/create-list.dto';
import { UpdateListDto } from '../dto/update-list.dto';
import { OrchestratorService } from '../orchestrator.service';
import { ListService } from './list.service';
import { AuthenticationGuard } from '@/users/guards/authentication.guard';
import { AuthenticationInterceptor } from '@/users/interceptors/authentication.interceptor';
import { CurrentUser } from '@/users/decorators/current-user';

@Controller('list')
export class ListController {
  constructor(
    private readonly listService: ListService,
    private readonly orchestratorService: OrchestratorService,
  ) {}

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Post()
  async create(
    @Body() createShoppingDto: CreateListDto,
    @CurrentUser() user: User,
  ) {
    return this.orchestratorService.createList({
      ...createShoppingDto,
      user,
    });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get()
  findAllByAuthor(@CurrentUser() user: User) {
    return this.orchestratorService.findListsBySubscriber({ user });
  }

  @UseGuards(AuthenticationGuard)
  @UseInterceptors(AuthenticationInterceptor)
  @Get(':id')
  findOneById(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: User,
  ) {
    return this.orchestratorService.findOneListById({ id, user });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShoppingDto: UpdateListDto) {
    return this.listService.update(+id, updateShoppingDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.listService.remove(+id);
  }
}
