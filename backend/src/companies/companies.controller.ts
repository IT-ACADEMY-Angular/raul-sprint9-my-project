import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Put,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  Query,
  Delete,
  ParseIntPipe,
  ClassSerializerInterceptor,
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, StorageEngine, File as MulterFile } from 'multer';
import { CreateCompanyDto } from './dto/create-company-dto';
import { cloudinaryStorage } from 'src/config/cloudinary-storage.config';
import { plainToInstance } from 'class-transformer';
import { CompanyDto } from './dto/company.dto';

const storage: StorageEngine = diskStorage({
  destination: './uploads',
  filename: (
    req: any,
    file: MulterFile,
    callback: (error: any, filename?: string) => void,
  ) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const originalName: string = (file as { originalname: string }).originalname;
    callback(null, uniqueSuffix + '-' + originalName);
  },
});

@UseInterceptors(ClassSerializerInterceptor)
@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  async createCompany(@Body() createCompanyDto: CreateCompanyDto): Promise<CompanyDto> {
    const { ownerId, name, photoUrl, workerData, appointmentInterval } = createCompanyDto;
    const company = await this.companiesService.createCompany(
      ownerId,
      name,
      photoUrl || '',
      workerData || [],
      appointmentInterval,
    );
    return plainToInstance(CompanyDto, company, { excludeExtraneousValues: true });
  }

  @Get()
  async getAllCompanies(): Promise<CompanyDto[]> {
    const companies = await this.companiesService.getAllCompanies();
    companies.sort((a, b) => a.name.localeCompare(b.name));
    return plainToInstance(CompanyDto, companies, { excludeExtraneousValues: true });
  }

  @Get('search')
  async searchCompanies(@Query('q') query: string): Promise<CompanyDto[]> {
    const companies = await this.companiesService.searchCompanies(query);
    return plainToInstance(CompanyDto, companies, { excludeExtraneousValues: true });
  }

  @Get(':id')
  async getCompany(@Param('id') id: number): Promise<CompanyDto> {
    const company = await this.companiesService.findCompanyById(id);
    return plainToInstance(CompanyDto, company, { excludeExtraneousValues: true });
  }

  @Put('photo')
  @UseInterceptors(FileInterceptor('file', { storage: cloudinaryStorage }))
  uploadCompanyPhoto(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new NotFoundException('No se encontró archivo');
    }
    const photoUrl = file.path;
    return { photoUrl };
  }

  @Put(':id')
  async updateCompany(
    @Param('id') id: number,
    @Body() updateCompanyDto: CreateCompanyDto
  ): Promise<CompanyDto> {
    const company = await this.companiesService.updateCompany(id, updateCompanyDto);
    return plainToInstance(CompanyDto, company, { excludeExtraneousValues: true });
  }

  @Get('user/:userId')
  async getCompanyByUser(@Param('userId', ParseIntPipe) userId: number): Promise<CompanyDto | { message: string }> {
    const company = await this.companiesService.getCompanyByUserId(userId);
    if (!company) {
      return { message: 'El usuario no tiene una empresa registrada.' };
    }
    return plainToInstance(CompanyDto, company, { excludeExtraneousValues: true });
  }

  @Delete('owner/:ownerId')
  async deleteCompanyByOwner(@Param('ownerId', ParseIntPipe) ownerId: number) {
    const deleted = await this.companiesService.deleteCompanyByOwnerId(ownerId);
    if (!deleted) {
      throw new NotFoundException('No se encontró la empresa para este usuario');
    }
    return { message: 'Empresa eliminada correctamente' };
  }
}