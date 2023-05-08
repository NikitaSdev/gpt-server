import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { UserService } from './user.service';
import { Auth } from '../auth/decorators/auth.decorator';
import { User } from './decorators/user.decorator';
import { UpdateUserDto } from './dto/updateUser.dto';
import { IdValidationPipe } from '../pipes/id.validation.pipe';
import { subscribeDTO } from './dto/subscribe.dto';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get('profile')
  @Auth()
  async getProfile(@User('_id') _id: string) {
    return this.userService.byId(_id);
  }
  @Post('getSubscribe')
  async getSubscribe(@Body() dto: subscribeDTO) {
    return this.userService.getSubscribe(dto);
  }
  @UsePipes(new ValidationPipe())
  @Put('profile')
  @HttpCode(200)
  @Auth()
  async updateProfile(@User('_id') _id: string, @Body() dto: UpdateUserDto) {
    return this.userService.updateProfile(_id, dto);
  }
  @UsePipes(new ValidationPipe())
  @Put(':id')
  @HttpCode(200)
  @Auth('admin')
  async updateUser(
    @Param('id', IdValidationPipe) id: string,
    @Body() dto: UpdateUserDto,
  ) {
    return this.userService.updateProfile(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @Auth('admin')
  async deleteUser(@Param('id', IdValidationPipe) id: string) {
    return this.userService.delete(id);
  }

  @Get('count')
  @Auth('admin')
  async getCount() {
    return this.userService.getCount();
  }
  @Get()
  @Auth('admin')
  async getAll(@Query('searchTerm') searchTerm?: string) {
    return this.userService.getAll(searchTerm);
  }
  @Get(':id')
  @Auth('admin')
  async getUser(@Param('id', IdValidationPipe) id: string) {
    return this.userService.byId(id);
  }
}
