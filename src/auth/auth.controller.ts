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
import { Public, ResponseMessage } from '@/decorator/customize';
import { LocalAuthGuard } from './auth.guard';
import { RegisterUserDto } from '@/users/dto/create-user.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@Req() req) {
    return req.user;
  }

  @Public()
  @UseGuards(LocalAuthGuard)
  @Post('/login')
  async handleLoginStateless(@Req() req) {
    return this.authService.login(req.user);
  }

  @Public()
  @ResponseMessage('Register a new user')
  @Post('/register')
  async handleRegister(@Body() createUserDto: RegisterUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('logout')
  logout(@Req() req: Request, @Res() res: Response) {
    /* destroys user session */
    req.session.destroy(function (err) {
      if (err) console.log(err);
      return res.redirect('/');
    });
  }
}
