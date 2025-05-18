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
import { ResumesService } from './resumes.service';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { IUser } from '@/users/user.interface';

@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @ResponseMessage('Create resume successfully')
  @Post()
  create(@Body() createResumeDto: CreateResumeDto, @User() user: IUser) {
    return this.resumesService.create(createResumeDto, user);
  }

  @ResponseMessage('Get all resumes')
  @Public()
  @Get()
  findAll(
    @Query('current') currentPage: string,
    @Query('pageSize') limit: string,
    @Query() queryString: string,
  ) {
    return this.resumesService.findAll(+currentPage, +limit, queryString);
  }

  @ResponseMessage('Get resume successfully')
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @ResponseMessage('Update resume successfully')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateResumeDto: UpdateResumeDto,
    @User() user: IUser,
  ) {
    return this.resumesService.update(id, updateResumeDto, user);
  }

  @ResponseMessage('Update status resume successfully')
  @Patch(':id/status')
  updateStatus(
    @Param('id') id: string,
    @User() user: IUser,
    @Body('status') status: string,
  ) {
    return this.resumesService.updateStatus(id, user, status);
  }

  @Post('by-user')
  @ResponseMessage('Get all resumes by user')
  findAllByUser(@User() user: IUser) {
    return this.resumesService.findByUser(user);
  }

  @ResponseMessage('Delete resume successfully')
  @Delete(':id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }
}
