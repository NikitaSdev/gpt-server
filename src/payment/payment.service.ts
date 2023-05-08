import { Injectable } from "@nestjs/common"
import YooKassa from "yookassa"
import { pay } from "telegraf/typings/button"

const yooKassa = new YooKassa({
  shopId: process.env.SHOP_ID,
  secretKey: process.env.YOOKASSA_KEY
})
@Injectable()
export class PaymentService {
  async payment() {
    const payment = await yooKassa.createPayment({
      amount: {
        value: "2.00",
        currency: "RUB"
      },
      payment_method_data: {
        type: "bank_card"
      },
      confirmation: {
        type: "redirect",
        return_url: "https://www.merchant-website.com/return_url"
      },
      description: "Заказ №72"
    })
    return payment
  }
}
