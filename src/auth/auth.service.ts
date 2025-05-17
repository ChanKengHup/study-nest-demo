import { RegisterUserDto } from '@/users/dto/create-user.dto';
import { IUser } from '@/users/user.interface';
import { UsersService } from '@/users/users.service';
import { BadRequestException, Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getHashPassword } from './shared/tools';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findByEmail(username);

    if (user) {
      const isValid = this.usersService.isValidPassword(pass, user.password);

      if (isValid) {
        return user;
      }
    }

    return null;
  }

  async login(user: IUser) {
    const { _id, name, email, role } = user;

    const payload = {
      sub: 'token login',
      iss: 'from server',
      _id,
      name,
      email,
      role,
    };
    return {
      access_token: this.jwtService.sign(payload),
      _id,
      name,
      email,
      role,
    };
  }

  async register(user: RegisterUserDto) {
    const hashPassword = getHashPassword(user.password);
    const userExist = await this.usersService.findByEmail(user.email);

    if (userExist) {
      throw new BadRequestException('User already exists');
    }

    const createdUser = await this.usersService.registerUser({
      ...user,
      password: hashPassword,
    });

    return {
      _id: createdUser._id,
      createdAt: createdUser.createdAt,
    };
  }
}
