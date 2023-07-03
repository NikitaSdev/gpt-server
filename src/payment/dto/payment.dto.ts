import { IsNumber } from "class-validator"

export class PaymentDto {
  @IsNumber()
  id: number
}
