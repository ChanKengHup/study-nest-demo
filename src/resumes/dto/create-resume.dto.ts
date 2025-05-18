import { Type } from 'class-transformer';
import {
  IsArray,
  IsNotEmpty,
  IsObject,
  IsString,
  ValidateNested,
} from 'class-validator';
import mongoose from 'mongoose';

class UpdatedBy {
  @IsString()
  @IsNotEmpty()
  _id: mongoose.Schema.Types.ObjectId;

  @IsString()
  @IsNotEmpty()
  name: string;
}

export class History {
  @IsString()
  @IsNotEmpty()
  status: string;

  @Type(() => UpdatedBy)
  @ValidateNested()
  @IsObject()
  @IsNotEmpty()
  updatedBy: UpdatedBy;
}

export class CreateResumeDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  userId: string;

  @IsString()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsNotEmpty()
  status: string;

  @IsString()
  @IsNotEmpty()
  companyId: string;

  @IsString()
  @IsNotEmpty()
  jobId: string;

  @Type(() => History)
  @ValidateNested()
  @IsArray()
  history: History[];
}
