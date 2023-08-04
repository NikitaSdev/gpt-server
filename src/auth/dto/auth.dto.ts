import {  IsString,  IsNumber } from "class-validator"

export class TelegramLoginDto {
  @IsNumber()
  id: number
  @IsString()
  first_name: string
}
