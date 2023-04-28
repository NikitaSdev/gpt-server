import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from 'nestjs-typegoose';
import { ModelType } from '@typegoose/typegoose/lib/types';
import { TelegramUser, UserModel } from 'src/user/user.model';
import {
  AuthDto,
  RegisterDto,
  TelegramLoginDto,
  TelegramRegisterDto,
} from './dto/auth.dto';
import { compare, genSalt, hash } from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { RefreshTokenDto } from './dto/refreshToken.dto';
import { MailService } from '../service/mail.service';
import { v4 as uuidv4 } from 'uuid';
@Injectable()
export class AuthService {
  constructor(
    @InjectModel(UserModel) private readonly UserModel: ModelType<UserModel>,
    @InjectModel(TelegramUser)
    private readonly TelegramUser: ModelType<TelegramUser>,
    private readonly jwtService: JwtService,
  ) {}

  async login(dto: AuthDto) {
    const user = await this.validateUser(dto);
    const tokens = await this.issueTokenPair(String(user._id));
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }
  async register(dto: RegisterDto) {
    const mailService = new MailService();
    const emailMatch = await this.UserModel.findOne({
      email: dto.email,
    });
    const loginMatch = await this.UserModel.findOne({
      login: dto.login,
    });
    if (loginMatch) {
      throw new BadRequestException('This login is already taken');
    }
    if (emailMatch) {
      throw new BadRequestException('This email is already taken');
    }
    const salt = await genSalt();
    const newUser = new this.UserModel({
      email: dto.email,
      login: dto.login,
      activationLink: uuidv4(),
      password: await hash(dto.password, salt),
    });

    const tokens = await this.issueTokenPair(String(newUser._id));
    const telegramUser = await this.TelegramUser.findOne({ email: dto.email });
    if ((telegramUser && telegramUser.activated) || newUser.activated) {
      newUser.activated = true;
      telegramUser.activated = true;
    }
    if ((telegramUser && !telegramUser.activated) || !newUser.activated) {
      await mailService.sendActivationMail(
        dto.email,
        `${process.env.API_URL}/api/auth/activate/${newUser.activationLink}`,
      );
    }
    const user = await newUser.save();
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }
  async telegramLogin(dto: TelegramLoginDto) {
    const user = await this.TelegramUser.findOne({
      telegramID: dto.telegramID,
    });
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    const tokens = await this.issueTokenPair(String(user._id));
    return {
      user: user.firstName,
      photoURL: user.photoURL,
      telegramID: user.telegramID,
      ...tokens,
    };
  }
  async telegramRegister(dto: TelegramRegisterDto) {
    const mailService = new MailService();
    const commonUser = await this.UserModel.findOne({
      email: dto.email,
    }).exec();
    const checkEmail = await this.UserModel.findOneAndUpdate(
      { email: dto.email },
      { telegram: dto.telegramID },
      { new: true },
    ).exec();

    const IDMatch = await this.TelegramUser.findOne({
      telegramID: dto.telegramID,
    });
    if (IDMatch) {
      throw new BadRequestException('You already has an account');
    }
    const newUser = new this.TelegramUser({
      email: dto.email,
      activationLink: uuidv4(),
      telegramID: dto.telegramID,
      photoURL: dto.photoURL,
      firstName: dto.firstName,
    });

    const tokens = await this.issueTokenPair(String(newUser._id));
    if (newUser.activated || (commonUser && commonUser.activated)) {
      newUser.activated = true;
      commonUser && (commonUser.activated = true); // check for null before modifying object
    }
    if (!newUser.activated || (commonUser && !commonUser.activated)) {
      await mailService.sendActivationMail(
        dto.email,
        `${process.env.API_URL}/api/auth/activate/${newUser.activationLink}`,
      );
    }
    const user = await newUser.save();
    return {
      checkEmail,
      user: user.firstName,
      email: user.email,
      telegramID: dto.telegramID,
      photoURL: user.photoURL,
      ...tokens,
    };
  }
  async activate(activationLink: string) {
    const user = await this.UserModel.findOne({ activationLink });
    if (!user) {
      const telegramUser = await this.TelegramUser.findOne({ activationLink });
      if (!telegramUser) {
        throw new Error('Неккоректная ссылка');
      } else {
        telegramUser.activated = true;
        await telegramUser.save();
      }
    } else {
      const findTelegram = await this.TelegramUser.findOne({
        telegram: user.telegram[0],
      });
      if (findTelegram) {
        findTelegram.activated = true;
        await findTelegram.save();
      }
      user.activated = true;
      await user.save();
    }
  }

  async validateUser(dto: AuthDto): Promise<UserModel> {
    const User = await this.UserModel.findOne({
      $or: [{ email: dto.emailOrLogin }, { login: dto.emailOrLogin }],
    });
    if (!User) {
      throw new UnauthorizedException('User not found');
    }
    const isValidPassword = await compare(dto.password, User.password);
    if (!isValidPassword) {
      throw new UnauthorizedException('Wrong password');
    }
    return User;
  }
  async issueTokenPair(userId: string) {
    const data = { _id: userId };
    const refreshToken = await this.jwtService.signAsync(data, {
      expiresIn: '15d',
    });

    const accessToken = await this.jwtService.signAsync(data, {
      expiresIn: '1h',
    });
    return { refreshToken, accessToken };
  }
  returnUserFields(user: UserModel) {
    return {
      _id: user._id,
      login: user.login,
      email: user.email,
      subscribe: user.subscribe,
      subscribeExpiresAt: user.subscribeExpiresAt,
      isAdmin: user.isAdmin,
      telegram: user.telegram,
    };
  }
  async getNewTokens({ refreshToken }: RefreshTokenDto) {
    if (!refreshToken) {
      throw new UnauthorizedException('Sign in, bastard');
    }
    const result = await this.jwtService.verifyAsync(refreshToken);
    if (!result) {
      throw new UnauthorizedException('Invalid token or expired');
    }
    const user = await this.UserModel.findById(result._id);
    const tokens = await this.issueTokenPair(String(user._id));
    return {
      user: this.returnUserFields(user),
      ...tokens,
    };
  }
}
