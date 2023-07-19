import { IsEmail, IsNumber } from "class-validator"

export class PaymentDto {
  @IsNumber()
  id: number
  @IsEmail()
  email: string
}
