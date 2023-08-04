import {
  BadRequestException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common"
import { InjectModel } from "nestjs-typegoose"
import { ModelType } from "@typegoose/typegoose/lib/types"
import { TelegramUser } from "src/user/user.model"
import { TelegramLoginDto } from "./dto/auth.dto"
import { JwtService } from "@nestjs/jwt"
import { RefreshTokenDto } from "./dto/refreshToken.dto"

@Injectable()
export class AuthService {
  constructor(
    @InjectModel(TelegramUser)
    private readonly TelegramUser: ModelType<TelegramUser>,
    private readonly jwtService: JwtService
  ) {}

  async telegramLogin(dto: TelegramLoginDto) {
    const user = await this.TelegramUser.findOne({
      telegramID: dto.id
    })
    if (!user) {
      console.log(typeof dto.id)
      const newUser = new this.TelegramUser({
        telegramID: dto.id,
        first_name: dto.first_name
      })

      await newUser.save()
      const tokens = await this.issueTokenPair(String(dto.id))

      return {
        user: {
          usage: newUser.usage,
          telegramID: newUser.telegramID,
          first_name: newUser.first_name,
          subscribe: newUser.subscribe,
          subscribeExpiresAt: newUser.subscribeExpiresAt
        },
        ...tokens
      }
    }
    const tokens = await this.issueTokenPair(String(dto.id))
    return {
      user: {
        usage: user.usage,
        id: user.telegramID,
        first_name: user.first_name,
        subscribe: user.subscribe,
        subscribeExpiresAt: user.subscribeExpiresAt
      },
      ...tokens
    }
  }

  async issueTokenPair(userId: string) {
    const data = { id: userId }
    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: "15d"
    })

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: "1h"
    })
    return { refreshToken, accessToken }
  }
  returnUserFields(user: TelegramUser) {
    return {
      usage: user.usage,
      id: user.telegramID,
      first_name: user.first_name,
      subscribe: user.subscribe,
      subscribeExpiresAt: user.subscribeExpiresAt
    }
  }
  async handleUsage(id: { telegramID: number }) {
    const user = await this.TelegramUser.findOne({
      telegramID: id.telegramID
    })

    if (!user) throw new BadRequestException("Пользователь не найден")
    user.usage = user.usage + 1
    await user.save()
    return this.returnUserFields(user)
  }
  async getNewTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      throw new UnauthorizedException("Sign in")
    }
    const result = await this.jwtService.verifyAsync(refreshToken)
    if (!result) {
      throw new UnauthorizedException("Invalid token or expired")
    }
    const user = await this.TelegramUser.findOne({ telegramID: result.id })
    const tokens = await this.issueTokenPair(String(user._id))
    return {
      user: user,
      ...tokens
    }
  }
}
