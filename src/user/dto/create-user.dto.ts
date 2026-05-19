import { IsEmail, IsString, IsOptional, IsUrl } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsOptional()
  full_name?: string;

  @IsUrl()
  @IsOptional()
  avatar_url?: string;
}
