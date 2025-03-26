import { IsNotEmpty, IsOptional, IsArray, ArrayNotEmpty, IsString, IsNumber } from 'class-validator';

export class CreateCompanyDto {
  @IsNumber()
  @IsNotEmpty()
  ownerId: number;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  photoUrl?: string;

  @IsArray()
  @IsOptional()
  workerData?: any[];

  @IsNumber()
  @IsNotEmpty()
  appointmentInterval: number;
}
