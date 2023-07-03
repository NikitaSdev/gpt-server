import { Injectable } from "@nestjs/common"
import { Cron } from "@nestjs/schedule/dist"
import { InjectModel } from "nestjs-typegoose"
import { ModelType } from "@typegoose/typegoose/lib/types"
import { TelegramUser } from "../user/user.model"

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(TelegramUser)
    private readonly TelegramUser: ModelType<TelegramUser>
  ) {}
  @Cron("* * * * * 6")
  async handleActivation() {
    try {
      const telegramUsers = await this.TelegramUser.find({
        activated: false
      })

      for (const user of telegramUsers) {
        await user.remove()
        console.log(
          `User with email ${(await user).first_name} has been removed.`
        )
      }
    } catch (e) {
      console.log(e)
    }
  }
  @Cron("* * 12 * * *")
  async handleSubscribe() {
    try {
      const currentTime = new Date()
      const telegramUsers = await this.TelegramUser.find({
        subscribeExpiresAt: { $lte: [currentTime] }
      })

      for (const user of telegramUsers) {
        user.subscribe = false
        await user.save()
        console.log(`${user.first_name} has no longer subscribe.`)
      }
    } catch (e) {
      console.log(e)
    }
  }
}
