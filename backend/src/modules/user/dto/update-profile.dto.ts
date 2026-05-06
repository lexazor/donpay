import { IsEmail, IsOptional, IsString, Matches } from 'class-validator';

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  fullName?: string;

  @IsOptional()
  @Matches(/^\+62\d{8,13}$/)
  whatsapp?: string;

  @IsOptional()
  @IsEmail()
  email?: string;
}
