import { IsEnum, IsString } from 'class-validator';

export enum MemberRole {
  admin = 'admin',
  member = 'member',
}

export class AddMemberDto {
  @IsString()
  userId!: string;

  @IsEnum(MemberRole)
  role!: MemberRole;
}
