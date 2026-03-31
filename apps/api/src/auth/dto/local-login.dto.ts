import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class LocalLoginDto {
  @IsEmail({}, { message: "Adresse email invalide" })
  @IsNotEmpty({ message: "L'email est requis" })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: "Le mot de passe est requis" })
  password!: string;
}
