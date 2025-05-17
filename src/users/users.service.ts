import {
  BadRequestException,
  Injectable,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import mongoose from 'mongoose';
import { InjectModel } from '@nestjs/mongoose';
import { User, UserDocument } from './schemas/user.schema';
import { genSaltSync, hashSync, compareSync } from 'bcryptjs';
import { ConfigService } from '@nestjs/config';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateUserDto, RegisterUserDto } from './dto/create-user.dto';
import { getHashPassword } from '@/auth/shared/tools';
import { IUser } from './user.interface';
import aqp from 'api-query-params';

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

  async findAllWithPagination(
    currentPage: number,
    limit: number,
    queryString: string,
  ) {
    const { filter, sort, population } = aqp(queryString);
    delete filter.page;
    delete filter.limit;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.userModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.userModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .exec();

    return {
      meta: {
        current: currentPage, //trang hiện tại
        pageSize: limit, //số lượng bản ghi đã lấy
        pages: totalPages, //tổng số trang với điều kiện query
        total: totalItems, // tổng số phần tử (số bản ghi)
      },
      result, //kết quả query
    };
  }

  async findAll() {
    return await this.userModel.find({});
  }

  findOne(id: number) {
    const user = this.userModel
      .findById({
        _id: id,
      })
      .select('-password');

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  async findOneByUsername(username: string) {
    return await this.userModel.findOne({
      email: username,
    });
  }

  async findByEmail(email: string) {
    return await this.userModel.findOne({ email });
  }

  async create(createUserDto: CreateUserDto, user: IUser) {
    const hashPassword = getHashPassword(createUserDto.password);

    const userExist = await this.findByEmail(user.email);

    if (userExist) {
      throw new BadRequestException('User already exists');
    }

    const createdCat = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
      createdBy: {
        _id: user._id,
        email: user.email,
      },
    });
    return {
      _id: createdCat._id,
      createdAt: createdCat.createdAt,
    };
  }

  async registerUser(createUserDto: RegisterUserDto) {
    const hashPassword = getHashPassword(createUserDto.password);
    const registeredUser = await this.userModel.create({
      ...createUserDto,
      password: hashPassword,
    });
    return registeredUser;
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

  async deleteUser(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('User not found');
    }

    await this.userModel.updateOne(
      {
        _id: id,
      },
      {
        deletedBy: {
          _id: user._id,
          email: user.email,
        },
      },
    );

    return this.userModel.softDelete({
      _id: id,
    });
  }

  async updateUserToken(userId: string, refreshToken: string) {
    return await this.userModel.updateOne({ _id: userId }, { refreshToken });
  }

  isValidPassword(password: string, hash: string) {
    return compareSync(password, hash);
  }

  checkPassword(hash: string, plain: string) {
    return compareSync(hash, plain);
  }

  findUserByRefreshToken(refreshToken: string) {
    return this.userModel.findOne({ refreshToken });
  }
}
