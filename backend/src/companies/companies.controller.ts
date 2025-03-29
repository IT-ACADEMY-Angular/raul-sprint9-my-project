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
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, StorageEngine, File as MulterFile } from 'multer';
import { CreateCompanyDto } from './dto/create-company-dto';

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

@Controller('companies')
export class CompaniesController {
  constructor(private readonly companiesService: CompaniesService) { }

  @Post()
  async createCompany(@Body() createCompanyDto: CreateCompanyDto) {
    const { ownerId, name, photoUrl, workerData, appointmentInterval } = createCompanyDto;
    return this.companiesService.createCompany(
      ownerId,
      name,
      photoUrl || '',
      workerData || [],
      appointmentInterval,
    );
  }

  @Get()
  async getAllCompanies() {
    const companies = await this.companiesService.getAllCompanies();
    return companies.sort((a, b) => a.name.localeCompare(b.name));
  }

  @Get('search')
  async searchCompanies(@Query('q') query: string) {
    return this.companiesService.searchCompanies(query);
  }

  @Get(':id')
  async getCompany(@Param('id') id: number) {
    return this.companiesService.findCompanyById(id);
  }

  @Put('photo')
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadCompanyPhoto(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new NotFoundException('No se encontró archivo');
    }
    const photoUrl = `http://localhost:3000/uploads/${file.filename}`;
    return { photoUrl };
  }
  
  @Put(':id')
  async updateCompany(
    @Param('id') id: number,
    @Body() updateCompanyDto: CreateCompanyDto
  ) {
    return this.companiesService.updateCompany(id, updateCompanyDto);
  }

  @Get('user/:userId')
  async getCompanyByUser(@Param('userId', ParseIntPipe) userId: number) {
    return this.companiesService.getCompanyByUserId(userId);
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
