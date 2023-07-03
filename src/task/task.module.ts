import { Module } from "@nestjs/common"
import { TypegooseModule } from "nestjs-typegoose"
import { TelegramUser } from "../user/user.model"
import { ConfigModule } from "@nestjs/config"
import { TaskService } from "./task.service"
import { ScheduleModule } from "@nestjs/schedule"

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
  providers: [TaskService]
})
export class TaskModule {}
