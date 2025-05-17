import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService implements OnModuleInit {
  constructor(
    @InjectModel(User.name)
    private userModel: SoftDeleteModel<UserDocument>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const count = await this.userModel.count();
    if (count === 0) {
      const salt = genSaltSync(10);
      const hash = hashSync(
        this.configService.get<string>('INIT_USER_PASSWORD'),
        salt,
      );
      await this.userModel.insertMany([
        {
          name: 'Eric',
          email: 'admin@gmail.com',
          password: hash,
        },
        {
          name: 'User',
          email: 'user@gmail.com',
          password: hash,
        },
        {
          name: 'User 1',
          email: 'user1@gmail.com',
          password: hash,
        },
        {
          name: 'User 2',
          email: 'user2@gmail.com',
          password: hash,
        },
        {
          name: 'User 3',
          email: 'user3@gmail.com',
          password: hash,
        },
      ]);
    }
  }

  async findAll() {
    return await this.userModel.find({});
  }

  findOne(id: number) {
    const user = this.userModel.findById({
      _id: id,
    });

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByUsername(username: string) {
    console.log(
      '🚀 ~ users.service.ts ~ UsersService ~ findOneByUsername ~ username:',
      username,
    );

    return await this.userModel.findOne({
      email: username,
    });
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  getHashPassword(password) {
    const salt = genSaltSync(10);
    const hash = hashSync(password, salt);

    return hash;
  }

  async create(createUserDto: CreateUserDto) {
    const hashPassword = this.getHashPassword(createUserDto.password);
    const createdCat = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
    return createdCat;
  }

  async update(updateUserDto: UpdateUserDto) {
    if (!mongoose.Types.ObjectId.isValid(updateUserDto._id)) {
      throw new NotFoundException('User not found');
    }

    return await this.userModel.updateOne(
      { _id: updateUserDto._id },
      { ...updateUserDto },
    );
  }

  deleteUser(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }
    return this.userModel.softDelete({
      _id: id,
    });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  checkPassword(hash: string, plain: string) {
    return compareSync(hash, plain);
  }
}
