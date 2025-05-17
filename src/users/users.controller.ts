import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseMessage, User } from '@/decorator/customize';
import { IUser } from './user.interface';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ResponseMessage('Get all users')
  findAll() {
    return this.usersService.findAll();
  }

  @Get('pagination')
  @ResponseMessage('Get all users with pagination')
  findAllWithPagination(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() queryString: string,
  ) {
    return this.usersService.findAllWithPagination(
      +currentPage,
      +limit,
      queryString,
    );
  }

  @Post()
  @ResponseMessage('Create a new User')
  create(@Body() createUserDto: CreateUserDto, @User() user: IUser) {
    return this.usersService.create(createUserDto, user);
  }

  @Get(':id')
  @ResponseMessage('Find a User')
  findOne(@Param('id') id: number) {
    return this.usersService.findOne(id);
  }

  @Patch()
  @ResponseMessage('Update a User')
  update(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(updateUserDto);
  }

  @Delete(':id')
  @ResponseMessage('Delete a User')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.usersService.deleteUser(id, user);
  }
}
