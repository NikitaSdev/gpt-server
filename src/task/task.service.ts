import { Injectable } from "@nestjs/common"
import { Cron } from "@nestjs/schedule/dist"
import { InjectModel } from "nestjs-typegoose"
import { ModelType } from "@typegoose/typegoose/lib/types"
import { TelegramUser, UserModel } from "../user/user.model"

@Injectable()
export class TaskService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    @InjectModel(TelegramUser)
    private readonly TelegramUser: ModelType<TelegramUser>
  ) {}
  @Cron("* * * * * 6")
  async handleActivation() {
    try {
      const users = await this.UserModel.find({
        activated: false
      })
      const telegramUsers = await this.TelegramUser.find({
        activated: false
      })
      for (const user of users) {
        await user.remove()
        console.log(`User with email ${user.email} has been removed.`)
      }
      for (const user of telegramUsers) {
        await user.remove()
        console.log(`User with email ${user.email} has been removed.`)
      }
    } catch (e) {
      console.log(e)
    }
  }
  @Cron("* * 12 * * *")
  async handleSubscribe() {
    try {
      const currentTime = new Date()
      const users = await this.UserModel.find({
        subscribeExpiresAt: { $lte: [currentTime] }
      })
      const telegramUsers = await this.TelegramUser.find({
        subscribeExpiresAt: { $lte: [currentTime] }
      })
      for (const user of users) {
        user.subscribe = false
        await user.save()
        console.log(`${user.email} has no longer subscribe.`)
      }
      for (const user of telegramUsers) {
        user.subscribe = false
        await user.save()
        console.log(`${user.email} has no longer subscribe.`)
      }
    } catch (e) {
      console.log(e)
    }
  }
}
// setInterval(async () => {
//   const currentTime = new Date()
//   const commonUsersToDelete = await this.UserModel.find({
//     activated: false
//   })
//   const telegramUsersToDelete = await this.TelegramUser.find({
//     activated: false
//   })
//   const commonUsersToRemoveSubscribe = await this.UserModel.find({
//     activated: false
//   })
//   const telegramUsersToRemoveSubscribe = await this.TelegramUser.find({
//     subscribeExpiresAt: new Date()
//   })
//   for (const user of commonUsersToDelete) {
//     await user.remove()
//     console.log(`User with email ${user.email} has been removed.`)
//   }
//   for (const user of telegramUsersToDelete) {
//     await user.remove()
//     console.log(`User with email ${user.email} has been removed.`)
//   }
// }, 7 * 24 * 60 * 60 * 1000)
