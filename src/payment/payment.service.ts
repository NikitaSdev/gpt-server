import * as YooKassa from "yookassa"
import { PaymentDto } from "./dto/payment.dto"
import { PaymentStatusDto } from "./dto/paymentStatus.dto"
import { InjectModel } from "nestjs-typegoose"
import { ModelType } from "@typegoose/typegoose/lib/types"
import { TelegramUser } from "src/user/user.model"

const yooKassa = new YooKassa({
  shopId: "237031",
  secretKey: "test_AuOmDn5XqDprdqvK6AHHFF8zxCJH_YaEtu7MhJKGbqc"
})

export class PaymentService {
  constructor(
    @InjectModel(TelegramUser)
    private readonly TelegramUser: ModelType<TelegramUser>
  ) {}
  async payment(dto: PaymentDto) {
    try {
      const telegramUser = await this.TelegramUser.findOne({
        telegramID: dto.id
      })

      const payment = await yooKassa.createPayment({
        amount: {
          value: "300.00",
          currency: "RUB"
        },
        capture: true,
        payment_method_data: {
          type: "bank_card"
        },
        receipt: {
          customer: {
            email: dto.email
          },
          items: [
            {
              description: "Подписка на месяц",
              quantity: "1",
              amount: {
                value: "300.00",
                currency: "RUB"
              },
              vat_code: "1",
              payment_mode: "full_prepayment",
              payment_subject: "service"
            }
          ]
        },
        confirmation: {
          type: "redirect",
          return_url: "https://djipiti.chat"
        },
        description: "Покупка подписки на месяц"
      })

      if (telegramUser) {
        telegramUser.payment_id = payment.id
        await telegramUser.save()
      }
      return payment
    } catch (e) {
      console.log(e)
    }
  }
  async paymentStatus(dto: PaymentStatusDto) {
    if (dto.object.paid) {
      const telegramUser = await this.TelegramUser.findOne({
        payment_id: dto.object.id
      })
      if (telegramUser) {
        telegramUser.subscribe = true
        telegramUser.subscribeExpiresAt = new Date(dto.object.captured_at)
        telegramUser.subscribeExpiresAt.setDate(
          telegramUser.subscribeExpiresAt.getDate() + 30
        )
        await telegramUser.save()
      }
      return dto
    }
  }
}
