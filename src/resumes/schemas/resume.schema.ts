import { Company } from '@/companies/schemas/company.schema';
import { Job } from '@/jobs/schemas/job.schema';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose, { HydratedDocument } from 'mongoose';

export type ResumeDocument = HydratedDocument<Resume>;

interface History {
  status: string;
  updatedAt: Date;
  updatedBy: { _id: mongoose.Schema.Types.ObjectId; name: string };
}

@Schema({ timestamps: true })
export class Resume {
  @Prop()
  name: string;

  @Prop()
  userId: string;

  @Prop()
  url: string;

  @Prop()
  status: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Company.name })
  companyId: string;

  @Prop({ type: mongoose.Schema.Types.ObjectId, ref: Job.name })
  jobId: string;

  @Prop()
  history: History[];

  @Prop({ type: Object })
  createdBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

  @Prop({ type: Object })
  updatedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

  @Prop({ type: Object })
  deletedBy: {
    _id: mongoose.Schema.Types.ObjectId;
    name: string;
  };

  @Prop()
  createdAt: Date;

  @Prop()
  updatedAt: string;

  @Prop()
  isDelete: boolean;

  @Prop()
  deletedAt: Date;
}

export const ResumeSchema = SchemaFactory.createForClass(Resume);
