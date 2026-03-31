import { PartialType } from '@nestjs/mapped-types';
import { CreateUserDto } from './create-user.dto';
import { IsOptional, IsString } from 'class-validator';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsOptional()
  @IsString()
  email: any;

  @IsOptional()
  @IsString()
  password: any;

  @IsOptional()
  @IsString()
  display_name: any;

  @IsOptional()
  @IsString()
  first_name: any;

  @IsOptional()
  @IsString()
  last_name: any;
}
