import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateResumeDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { InjectModel } from '@nestjs/mongoose';
import { Resume, ResumeDocument } from './schemas/resume.schema';
import mongoose from 'mongoose';
import { IUser } from '@/users/user.interface';
import { SoftDeleteModel } from 'soft-delete-plugin-mongoose';
import aqp from 'api-query-params';

@Injectable()
export class ResumesService {
  constructor(
    @InjectModel(Resume.name)
    private resumeModel: SoftDeleteModel<ResumeDocument>,
  ) {}

  async create(createResumeDto: CreateResumeDto, user: IUser) {
    const resume = await this.resumeModel.create({
      ...createResumeDto,
      status: 'PENDING',
      history: [
        {
          status: 'PENDING',
          updatedAt: new Date(),
          updatedBy: {
            _id: user._id,
            name: user.name,
          },
        },
      ],
      createdBy: {
        _id: user._id,
        name: user.name,
      },
    });
    return resume;
  }

  async findAll(currentPage: number, limit: number, queryString: string) {
    const { filter, sort, population, projection } = aqp(queryString);
    delete filter.current;
    delete filter.pageSize;

    const offset = (+currentPage - 1) * +limit;
    const defaultLimit = +limit ? +limit : 10;

    const totalItems = (await this.resumeModel.find(filter)).length;
    const totalPages = Math.ceil(totalItems / defaultLimit);

    const result = await this.resumeModel
      .find(filter)
      .skip(offset)
      .limit(defaultLimit)
      .sort(sort as any)
      .populate(population)
      .select(projection)
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

  findOne(id: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Resume not found');
    }

    const resume = this.resumeModel.findById(id);

    return resume;
  }

  update(id: string, updateResumeDto: UpdateResumeDto, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Resume not found');
    }

    return this.resumeModel.updateOne(
      { _id: id },
      { ...updateResumeDto, updatedBy: { _id: user._id, name: user.name } },
    );
  }

  async updateStatus(id: string, user: IUser, status: string) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Resume not found');
    }

    return this.resumeModel.updateOne(
      { _id: id },
      {
        status,
        updatedBy: { _id: user._id, name: user.name },
        $push: {
          history: {
            status,
            updatedAt: new Date(),
            updatedBy: { _id: user._id, name: user.name },
          },
        },
      },
    );
  }

  async remove(id: string, user: IUser) {
    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new NotFoundException('Resume not found');
    }

    await this.resumeModel.updateOne(
      { _id: id },
      { deletedBy: { _id: user._id, name: user.name } },
    );

    return this.resumeModel.softDelete({ _id: id });
  }

  async findByUser(user: IUser) {
    return await this.resumeModel.find({ createdBy: { userId: user._id } });
  }
}
