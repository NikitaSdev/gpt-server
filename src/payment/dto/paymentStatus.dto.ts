class AmountPayment {
  value: string
  currency: string
}

class ObjectPayment {
  id: string
  status: string
  amount: AmountPayment
  paid: boolean
  captured_at: string
}
export class PaymentStatusDto {
  event: string
  object: ObjectPayment
  type: string
}
