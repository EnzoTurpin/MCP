import { IsOptional, IsString, Length, Matches } from 'class-validator';

export class UpdateStatusDto {
  @IsOptional()
  @IsString()
  @Length(1, 50, { message: 'Le nom doit contenir entre 1 et 50 caractères' })
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(/^#[0-9a-fA-F]{6}$/, { message: 'La couleur doit être un code hexadécimal valide' })
  color?: string;
}
