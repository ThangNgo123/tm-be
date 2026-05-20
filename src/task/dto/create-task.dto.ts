import {
  IsString,
  IsOptional,
  IsEnum,
  IsNumber,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { TaskStatus } from '../../entities/task-status.enum';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsEnum(TaskStatus)
  @IsOptional()
  status?: TaskStatus;

  @IsNumber()
  @IsOptional()
  priority?: number;

  @IsDateString()
  @IsOptional()
  due_date_start?: string;

  @IsDateString()
  @IsOptional()
  due_date_end?: string;

  @IsUUID()
  project_id: string;
}
