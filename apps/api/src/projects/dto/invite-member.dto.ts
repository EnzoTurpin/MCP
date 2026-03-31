import { IsEmail } from 'class-validator';

export class InviteMemberDto {
  @IsEmail({}, { message: 'Email invalide' })
  email!: string;
}
