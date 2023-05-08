import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { TelegramUser, UserModel } from './user.model';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { UpdateUserDto } from './dto/updateUser.dto';
import { genSalt, hash } from 'bcryptjs';
import { subscribeDTO } from './dto/subscribe.dto';

@Injectable()
export class UserService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    @InjectModel(TelegramUser)
    private readonly TelegramUser: ModelType<TelegramUser>,
  ) {
    setInterval(async () => {
      const commonUsersToDelete = await this.UserModel.find({
        activated: false,
      });
      const telegramUsersToDelete = await this.TelegramUser.find({
        activated: false,
      });
      for (const user of commonUsersToDelete) {
        await user.remove();
        console.log(`User with email ${user.email} has been removed.`);
      }
      for (const user of telegramUsersToDelete) {
        await user.remove();
        console.log(`User with email ${user.email} has been removed.`);
      }
    }, 7 * 24 * 60 * 60 * 1000);
  }
  async byId(_id: string) {
    const user = await this.UserModel.findById(_id).exec();
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
  async updateProfile(_id: string, dto: UpdateUserDto) {
    const user = await this.byId(_id);

    const isSameUser = await this.UserModel.findOne({ email: dto.email });
    if (isSameUser && String(_id) !== String(isSameUser._id)) {
      throw new NotFoundException('Email is busy');
    }
    if (dto.password) {
      const salt = await genSalt(10);
      user.password = await hash(dto.password, salt);
    }
    user.email = dto.email;
    await user.save();
    return;
  }

  async getCount() {
    return this.UserModel.find().count().exec();
  }
  async getAll(searchTerm?: string) {
    let options = {};
    if (searchTerm) {
      options = {
        $or: [
          {
            email: new RegExp(searchTerm, 'i'),
          },
        ],
      };
    }
    return this.UserModel.find(options)
      .select('-password -updatedAt -__v')
      .sort({ createdAt: 'desc' })
      .exec();
  }
  async delete(id: string) {
    return this.UserModel.findByIdAndDelete(id).exec();
  }
  async getSubscribe(dto: subscribeDTO) {
    const user = await this.UserModel.findOne({ email: dto.email });
    if (dto.paid) {
      user.subscribe = true;
      user.save();
    }
    return user;
  }
}
