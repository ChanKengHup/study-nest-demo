import { IsEmail, IsNotEmpty } from 'class-validator';

export class CreateUserDto {
  @IsEmail({}, { message: 'email invalid' })
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  password: string;

  name: string;
}
