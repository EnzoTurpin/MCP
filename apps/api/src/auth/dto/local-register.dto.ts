import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LocalRegisterDto {
  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  display_name!: string;
}
