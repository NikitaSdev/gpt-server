import { Module } from "@nestjs/common"
import { PaymentService } from "./payment.service"
import { PaymentController } from "./payment.controller"
import { TypegooseModule } from "nestjs-typegoose"
import { TelegramUser } from "../user/user.model"
import { ConfigModule } from "@nestjs/config"

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: TelegramUser,
        schemaOptions: {
          collection: "Telegram"
        }
      }
    ]),
    ConfigModule
  ],
  controllers: [PaymentController],
  providers: [PaymentService]
})
export class PaymentModule {}
