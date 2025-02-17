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
} from '@nestjs/common';
import { CompaniesService } from './companies.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, StorageEngine, File as MulterFile } from 'multer';

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
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
  async createCompany(
    @Body() body: { ownerId: number; name: string; photoUrl?: string; workerData?: { name: string; tasks?: { name: string; duration: number }[] }[] }
  ) {
    const { ownerId, name, photoUrl, workerData } = body;
    return this.companiesService.createCompany(ownerId, name, photoUrl || '', workerData || []);
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
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  @UseInterceptors(FileInterceptor('file', { storage }))
  uploadCompanyPhoto(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new NotFoundException('No se encontró archivo');
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    const photoUrl = `http://localhost:3000/uploads/${file.filename}`;
    return { photoUrl };
  }
}
