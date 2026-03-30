import {
  IsString,
  IsUUID,
  IsOptional,
  IsEnum,
  IsDateString,
  MaxLength,
} from 'class-validator';
import { TaskPriority } from '../../../prisma/generated/prisma/client';

export class CreateTaskDto {
  @IsString()
  @MaxLength(160)
  title: string;

  @IsUUID()
  status_id: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  assignee_id?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
