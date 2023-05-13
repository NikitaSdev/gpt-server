import * as YooKassa from "yookassa"
import { PaymentDto } from "./dto/payment.dto"
import { PaymentStatusDto } from "./dto/paymentStatus.dto"
import { InjectModel } from "nestjs-typegoose"
import { ModelType } from "@typegoose/typegoose/lib/types"
import { TelegramUser, UserModel } from "src/user/user.model"
import { BadRequestException } from "@nestjs/common"

const yooKassa = new YooKassa({
  shopId: "317449",
  secretKey: "test_4sIlBBtVlaWCBQ1TaKF2JM6bOGpgILpWkiwes9nWCV8"
})

export class PaymentService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    @InjectModel(TelegramUser)
    private readonly TelegramUser: ModelType<TelegramUser>
  ) {}
  async payment(dto: PaymentDto) {
    try {
      const commonUser = await this.UserModel.findOne({ email: dto.email })
      const telegramUser = await this.TelegramUser.findOne({ email: dto.email })
      if (
        (telegramUser && telegramUser.activated === false) ||
        (commonUser && commonUser.activated === false)
      ) {
        return new BadRequestException("Сначала подтвердите почту")
      }
      const payment = await yooKassa.createPayment({
        amount: {
          value: "300.00",
          currency: "RUB"
        },
        capture: true,
        payment_method_data: {
          type: "bank_card"
        },
        confirmation: {
          type: "redirect",
          return_url: "https://www.merchant-website.com/return_url"
        },
        description: "Покупка подписки на месяц"
      })
      if (commonUser) {
        commonUser.payment_id = payment.id
        await commonUser.save()
      }
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
      const commonUser = await this.UserModel.findOne({
        payment_id: dto.object.id
      })
      const telegramUser = await this.TelegramUser.findOne({
        payment_id: dto.object.id
      })
      if (commonUser) {
        commonUser.subscribe = true
        commonUser.subscribeExpiresAt = new Date(dto.object.captured_at)
        commonUser.subscribeExpiresAt.setDate(
          commonUser.subscribeExpiresAt.getDate() + 31
        )
        await commonUser.save()
      }
      if (telegramUser) {
        telegramUser.subscribe = true
        telegramUser.subscribeExpiresAt = new Date(dto.object.captured_at)
        telegramUser.subscribeExpiresAt.setDate(
          telegramUser.subscribeExpiresAt.getDate() + 31
        )
        await telegramUser.save()
      }
      return dto
    }
  }
}
