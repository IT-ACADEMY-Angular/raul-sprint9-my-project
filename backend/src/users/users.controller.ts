import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get(':email')
  async getUserByEmail(@Param('email') email: string) {
    return this.usersService.findByEmail(email);
  }

  @Post()
  async createUser(
    @Body() createUserDto: { email: string; password: string; name?: string },
  ) {
    return this.usersService.createUser(
      createUserDto.email,
      createUserDto.password,
      createUserDto.name,
    );
  }
}
