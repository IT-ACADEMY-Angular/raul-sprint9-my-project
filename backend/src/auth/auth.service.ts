import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      const { password: _password, ...result } = user;
      void _password;
      return result;
    }
    return null;
  }

  login(user: Omit<User, 'password'>) {
    return {
      message: 'Login successful',
      user,
    };
  }

  async register(registerDto: RegisterDto): Promise<Omit<User, 'password'>> {
    // Hashea la contraseña con 10 rondas de salt
    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    // Crea el usuario usando el UsersService. Asegúrate de que este método acepte los nuevos campos.
    const createdUser = await this.usersService.createUser(
      registerDto.email,
      hashedPassword,
      registerDto.name,
      registerDto.lastName,
      registerDto.phone,
    );

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _password, ...result } = createdUser;
    return result;
  }
}
