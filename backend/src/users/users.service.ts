import { Injectable, NotFoundException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './users.entity';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
  ) { }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    lastName: string,
    phone: string,
  ): Promise<User> {
    const user = this.usersRepository.create({
      email,
      password,
      name,
      lastName,
      phone,
    });
    return this.usersRepository.save(user);
  }

  async updateProfile(updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findByEmail(updateUserDto.email);
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.name = updateUserDto.name;
    user.lastName = updateUserDto.lastName;
    user.phone = updateUserDto.phone;
    if (updateUserDto.password && updateUserDto.password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(updateUserDto.password, 10);
      user.password = hashedPassword;
    }
    return this.usersRepository.save(user);
  }

  async updatePhoto(id: number, photoUrl: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException('Usuario no encontrado');
    }
    user.photoUrl = photoUrl;
    return this.usersRepository.save(user);
  }
}
