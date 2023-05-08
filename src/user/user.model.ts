import { Base, TimeStamps } from '@typegoose/typegoose/lib/defaultClasses';
import { prop } from '@typegoose/typegoose';

export interface UserModel extends Base {}
export interface TelegramUser extends Base {}
export class TelegramUser extends TimeStamps {
  @prop()
  email: string;
  @prop()
  firstName: string;
  @prop()
  photoURL: string;
  @prop({ unique: true })
  telegramID: number;
  @prop({ default: false })
  activated: boolean;
  @prop()
  activationLink: string;
  @prop({ default: false })
  subscribe: boolean;
  @prop()
  subscribeExpiresAt?: Date = new Date();
}

export class UserModel extends TimeStamps {
  @prop({ unique: true })
  login: string;
  @prop()
  email: string;
  @prop()
  emailOrLogin?: string;
  @prop()
  password: string;
  @prop({ default: false })
  subscribe: boolean;
  @prop()
  subscribeExpiresAt?: Date = new Date();
  @prop({ default: false })
  isAdmin: boolean;
  @prop({ each: true })
  telegram: string[];
  @prop({ default: false })
  activated: boolean;
  @prop()
  activationLink: string;
}
