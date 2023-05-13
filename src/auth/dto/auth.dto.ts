import { IsEmail, IsString, MinLength, IsNumber } from "class-validator"

export class AuthDto {
  @IsString()
  emailOrLogin: string

  @MinLength(6, {
    message: "Password must contains at least 6 characters"
  })
  @IsString()
  password: string
}
export class RegisterDto {
  @IsEmail()
  email: string
  @IsString()
  login: string

  @MinLength(6, {
    message: "Password must contains at least 6 characters"
  })
  @IsString()
  password: string
}
export class TelegramLoginDto {
  @IsNumber()
  telegramID: number
}
export class TelegramRegisterDto {
  @IsEmail()
  email: string
  @IsNumber()
  telegramID: number
  @IsString()
  firstName: string
  @IsString()
  photoURL: string
}
