import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import { AuthService } from './auth.service';
import { Public, ResponseMessage, User } from '@/decorator/customize';
import { LocalAuthGuard } from './auth.guard';
import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { IUser } from '@/users/user.interface';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Public()
  @ResponseMessage('User logged in successfully')
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async handleLogin(
    @Req() req,
    @Res({ passthrough: true }) response: Response,
  ) {
    return this.authService.login(req.user, response);
  }

  @Public()
  @ResponseMessage('Register a new user')
  @Post('/register')
  async handleRegister(@Body() createUserDto: RegisterUserDto) {
    return this.authService.register(createUserDto);
  }

  @ResponseMessage('Logout successfully')
  @Post('/logout')
  logout(@User() user: IUser, @Res({ passthrough: true }) response: Response) {
    return this.authService.logout(user, response);
  }

  @ResponseMessage('Get user account')
  @Get('/account')
  handleGetAccount(@User() user: IUser) {
    return { user };
  }

  @Public()
  @ResponseMessage('Refresh token')
  @Get('/refresh-token')
  handleRefreshToken(
    @Req() req: Request,
    @Res({ passthrough: true }) response: Response,
  ) {
    const refreshToken = req.cookies['refreshToken'];
    return this.authService.refreshToken(refreshToken, response);
  }
}
