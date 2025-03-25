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

  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  workingDays: string[];

  @IsString()
  @IsNotEmpty()
  startTime: string;

  @IsString()
  @IsNotEmpty()
  endTime: string;

  @IsNumber()
  @IsNotEmpty()
  appointmentInterval: number;

  @IsString()
  @IsOptional()
  breakStart?: string;

  @IsString()
  @IsOptional()
  breakEnd?: string;
}
