import {
  IsDateString,
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  MaxLength,
  Min,
} from 'class-validator';

enum TaskPriority {
  low = 'low',
  medium = 'medium',
  high = 'high',
}

export class UpdateTaskDto {
  @IsString()
  @IsOptional()
  @MaxLength(160)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  status_id?: string;

  @IsUUID()
  @IsOptional()
  assignee_id?: string;

  @IsDateString()
  @IsOptional()
  deadline?: string;

  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number;

  @IsEnum(TaskPriority)
  @IsOptional()
  priority?: TaskPriority;
}
