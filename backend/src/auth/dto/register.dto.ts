/* eslint-disable @typescript-eslint/no-unsafe-call */

import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsNotEmpty()
  phone: string;
}

export class RegisterDto {
  name: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
}
