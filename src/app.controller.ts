import { Controller, Get, Render, Req, Res, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { UsersService } from './users/users.service';
import { Request, Response } from 'express';
import { AuthenticatedGuard } from './stateful/passport/stateful.local.authenticated.guard';

@Controller()
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  getHomePage(@Req() req: Request, @Res() res: Response) {
    const isAuthenticated = req.isAuthenticated();
    return res.render('home', { isAuthenticated });
  }

  @UseGuards(AuthenticatedGuard)
  @Render('user')
  @Get('/user')
  async getUserPage() {
    const usersList = await this.usersService.findAll();
    return { users: usersList };
  }
}
