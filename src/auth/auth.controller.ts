import {
  Body,
  Controller,
  HttpCode,
  Post,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthDto,
  RegisterDto,
  TelegramLoginDto,
  TelegramRegisterDto,
} from './dto/auth.dto';
import { RefreshTokenDto } from './dto/refreshToken.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register')
  async register(@Body() dto: RegisterDto) {
    return this.AuthService.register(dto);
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login')
  async login(@Body() dto: AuthDto) {
    return this.AuthService.login(dto);
  }
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login/telegram')
  async telegramLogin(@Body() dto: TelegramLoginDto) {
    return this.AuthService.telegramLogin(dto);
  }
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('register/telegram')
  async telegramRegister(@Body() dto: TelegramRegisterDto) {
    return this.AuthService.telegramRegister(dto);
  }
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post('login/access-token')
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    return this.AuthService.getNewTokens(dto);
  }
}
