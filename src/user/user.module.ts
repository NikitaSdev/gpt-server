import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypegooseModule } from 'nestjs-typegoose';
import { TelegramUser, UserModel } from './user.model';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypegooseModule.forFeature([
      {
        typegooseClass: UserModel,
        schemaOptions: {
          collection: 'User',
        },
      },
      {
        typegooseClass: TelegramUser,
        schemaOptions: {
          collection: 'Telegram',
        },
      },
    ]),
    ConfigModule,
  ],
  providers: [UserService],
  controllers: [UserController],
})
export class UserModule {}
