import { Controller, Post, Request, UseGuards, Body, Get, Query, BadRequestException, Res } from '@nestjs/common';
import { Response } from 'express';
import * as jwt from 'jsonwebtoken';
import { AuthService } from './auth.service';
import { LocalAuthGuard } from './local-auth.guard';
import { AuthenticatedRequest } from './authenticated-request.interface';
import { RegisterDto } from './dto/register.dto';
import { UsersService } from 'src/users/users.service';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService, private usersService: UsersService) { }

  @UseGuards(LocalAuthGuard)
  @Post('login')
  login(@Request() req: AuthenticatedRequest) {
    return this.authService.login(req.user);
  }

  @Post('register')
  async register(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Get('verify')
  async verifyEmail(@Query('token') token: string, @Res() res: Response) {
    try {
      const secret = process.env.JWT_SECRET || 'default_secret';
      const payload: any = jwt.verify(token, secret);
      await this.usersService.markUserAsVerified(payload.email);
      res.send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Email Verificado</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              color: #3498db;
            }
            p {
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Email verificado</h1>
            <p>Gracias por verificar tu correo.</p>
            <a href="#" onclick="window.close(); return false;" style="color: red;">Cerrar esta ventana</a>
          </div>
        </body>
        </html>
      `);
    } catch (error) {
      res.status(400).send(`
        <!DOCTYPE html>
        <html lang="es">
        <head>
          <meta charset="UTF-8">
          <title>Error de verificación</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              background: #f0f0f0;
              display: flex;
              align-items: center;
              justify-content: center;
              height: 100vh;
              margin: 0;
            }
            .container {
              background: #fff;
              padding: 20px;
              border-radius: 8px;
              box-shadow: 0 0 10px rgba(0,0,0,0.1);
              text-align: center;
            }
            h1 {
              color: #e74c3c;
            }
            p {
              color: #333;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>Error de verificación</h1>
            <p>El token es inválido o ha expirado.</p>
            <a href="#" onclick="window.close(); return false;" style="color: red;">Cerrar esta ventana</a>
          </div>
        </body>
        </html>
      `);
    }
  }


}
