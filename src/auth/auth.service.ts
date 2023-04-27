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
      password: await hash(dto.password, salt),
    });
    const user = await newUser.save();
    const tokens = await this.issueTokenPair(String(user._id));
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
      telegramID: dto.telegramID,
      photoURL: dto.photoURL,
      firstName: dto.firstName,
    });
    const user = await newUser.save();
    const tokens = await this.issueTokenPair(String(user._id));

    return {
      checkEmail,
      user: user.firstName,
      email: user.email,
      telegramID: dto.telegramID,
      photoURL: user.photoURL,
      ...tokens,
    };
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
