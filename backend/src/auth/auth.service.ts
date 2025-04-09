import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { User } from '../users/users.entity';
import { RegisterDto } from './dto/register.dto';
import * as nodemailer from 'nodemailer';
import * as jwt from 'jsonwebtoken';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService
  ) { }

  async validateUser(
    email: string,
    pass: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(pass, user.password))) {
      if (!user.isVerified) {
        throw new UnauthorizedException(
          'Te hemos enviado un mail de verificación. Por favor, revisa tu correo para completar tu registro.'
        );
      }
      const { password: _password, ...result } = user;
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
    const existingUser = await this.usersService.findByEmail(registerDto.email);
    if (existingUser) {
      throw new ConflictException('Ya existe un usuario registrado con este mail');
    }

    const hashedPassword = await bcrypt.hash(registerDto.password, 10);

    const createdUser = await this.usersService.createUser(
      registerDto.email,
      hashedPassword,
      registerDto.name,
      registerDto.lastName,
      registerDto.phone,
    );

    const secret = this.configService.get<string>('JWT_SECRET', 'default_secret');
    const verificationToken = jwt.sign(
      { email: createdUser.email },
      secret,
      { expiresIn: '1d' }
    );

    await this.sendVerificationEmail(createdUser, verificationToken);

    const { password: _password, ...result } = createdUser;
    return result;
  }

  async sendVerificationEmail(user: User, token: string): Promise<void> {
    const transporter = nodemailer.createTransport({
      host: this.configService.get<string>('SMTP_HOST'),
      port: Number(this.configService.get<number>('SMTP_PORT')),
      secure: this.configService.get<string>('SMTP_SECURE') === 'true',
      auth: {
        user: this.configService.get<string>('SMTP_USER'),
        pass: this.configService.get<string>('SMTP_PASS'),
      },
    });

    const baseUrl = this.configService.get<string>('BASE_URL', 'http://localhost:3000');
    const verificationUrl = `${baseUrl.replace(/\/+$/, '')}/api/auth/verify?token=${encodeURIComponent(token)}`;

    console.log('Verification URL:', verificationUrl);

    const mailOptions = {
      from: '"ZYTAPP" <zytapp.help@gmail.com>',
      to: user.email,
      subject: 'Verifica tu cuenta en ZYTAPP',
      html: `<p>Hola,</p>
             <p>Para completar tu registro en ZYTAPP, haz clic en el siguiente enlace:</p>
             <p><a href="${verificationUrl}">Verificar mi cuenta</a></p>
             <p>Si no solicitaste este registro, ignora este correo.</p>`,
    };

    await transporter.sendMail(mailOptions);
  }
}
