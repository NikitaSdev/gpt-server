import {
  Body,
  Controller,
  HttpCode,
  Post,
  Param,
  UsePipes,
  Get,
  ValidationPipe
} from "@nestjs/common"
import { AuthService } from "./auth.service"
import { TelegramLoginDto } from "./dto/auth.dto"
import { RefreshTokenDto } from "./dto/refreshToken.dto"

@Controller("auth")
export class AuthController {
  constructor(private readonly AuthService: AuthService) {}

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("telegram")
  async telegramLogin(@Body() dto: TelegramLoginDto) {
    return this.AuthService.telegramLogin(dto)
  }

  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("login/access-token")
  async getNewTokens(@Body() dto: RefreshTokenDto) {
    return this.AuthService.getNewTokens(dto)
  }
  @UsePipes(new ValidationPipe())
  @HttpCode(200)
  @Post("handleUsage")
  async handleUsage(@Body() id: { telegramID: number }) {
    return this.AuthService.handleUsage(id)
  }
}
