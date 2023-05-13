import { Base, TimeStamps } from "@typegoose/typegoose/lib/defaultClasses"
import { prop } from "@typegoose/typegoose"

export interface UserModel extends Base {}
export interface TelegramUser extends Base {}
export class TelegramUser extends TimeStamps {
  @prop()
  email: string
  @prop()
  firstName: string
  @prop()
  photoURL: string
  @prop({ unique: true })
  telegramID: number
  @prop({ default: false })
  activated: boolean
  @prop()
  activationLink: string
  @prop({ default: false })
  subscribe: boolean
  @prop({ default: new Date() })
  subscribeExpiresAt: Date = new Date()
  @prop({ default: "" })
  payment_id: string
}

export class UserModel extends TimeStamps {
  @prop({ unique: true })
  login: string
  @prop()
  email: string
  @prop()
  emailOrLogin?: string
  @prop()
  password: string
  @prop({ default: false })
  subscribe: boolean
  @prop({ default: new Date() })
  subscribeExpiresAt: Date = new Date()
  @prop({ default: false })
  isAdmin: boolean
  @prop({ each: true })
  telegram: number[]
  @prop({ default: false })
  activated: boolean
  @prop()
  activationLink: string
  @prop({ default: "" })
  payment_id: string
}
