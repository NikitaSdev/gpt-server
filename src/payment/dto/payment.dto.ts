import { IsEmail, IsNumber } from "class-validator"

export class PaymentDto {
  @IsNumber()
  amount: number
  @IsEmail()
  email: string
}
