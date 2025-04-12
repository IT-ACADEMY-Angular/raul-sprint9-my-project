import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Put,
  NotFoundException,
  UploadedFile,
  UseInterceptors,
  Delete,
  ParseIntPipe,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../auth/dto/register.dto';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage, StorageEngine, File as MulterFile } from 'multer';
import { cloudinaryStorage } from 'src/config/cloudinary-storage.config';

// eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-assignment
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

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) { }

  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post()
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.usersService.createUser(
      createUserDto.email,
      createUserDto.password,
      createUserDto.name,
      createUserDto.lastName,
      createUserDto.phone,
    );
  }

  @Put('profile')
  updateProfile(@Body() updateUserDto: UpdateUserDto) {
    return this.usersService.updateProfile(updateUserDto);
  }

  @Post(':id/photo')
  @UseInterceptors(FileInterceptor('file', { storage: cloudinaryStorage }))
  async updatePhoto(@Param('id') id: number, @UploadedFile() file: MulterFile) {
    if (!file) {
      throw new NotFoundException('No se encontró archivo');
    }
    const photoUrl = file.path;
    return this.usersService.updatePhoto(id, photoUrl);
  }

  @Delete(':id')
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    const deleted = await this.usersService.deleteUser(id);
    if (!deleted) {
      throw new NotFoundException('Usuario no encontrado o no se pudo eliminar');
    }
    return { message: 'Cuenta eliminada correctamente' };
  }
}