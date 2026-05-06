import { IsString, Length } from 'class-validator';

export class SetupPinDto {
  @IsString()
  @Length(6, 6)
  pin: string;
}

export class VerifyPinDto {
  @IsString()
  @Length(6, 6)
  pin: string;
}
