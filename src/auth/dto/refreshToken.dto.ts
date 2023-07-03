import { IsString } from "class-validator"

export class RefreshTokenDto {
  @IsString({
    message: "Try again, asshole"
  })
  refreshToken: string
}
