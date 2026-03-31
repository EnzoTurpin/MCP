import { IsEmail, IsNotEmpty, IsString, MaxLength, MinLength } from 'class-validator';

export class LocalRegisterDto {
  @IsEmail({}, { message: "Adresse email invalide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  @MinLength(8, { message: "Le mot de passe doit contenir au moins 8 caractères" })
  password!: string;

  @IsString()
  @IsNotEmpty({ message: "Le nom d'affichage est requis" })
  @MaxLength(80, { message: "Le nom d'affichage ne peut pas dépasser 80 caractères" })
  display_name!: string;
}
