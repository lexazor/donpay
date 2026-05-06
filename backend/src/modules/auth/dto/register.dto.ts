import { IsEmail, IsString, Matches, MinLength } from 'class-validator';

export class RegisterDto {
  @IsString()
  fullName: string;

  @Matches(/^\+62\d{8,13}$/)
  whatsapp: string;

  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;
}
