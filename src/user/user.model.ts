import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"
import { prop } from "@typegoose/typegoose"

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface TelegramUser extends Base {}
export class TelegramUser extends TimeStamps {
  @prop()
  first_name: string
  @prop()
  photo_url: string
  @prop()
  username: string
  @prop({ unique: true })
  telegramID: number
  @prop({ default: false })
  subscribe: boolean
  @prop({ default: new Date() })
  subscribeExpiresAt: Date = new Date()
  @prop({ default: "" })
  payment_id: string
  @prop({ default: 0 })
  usage: number
}
