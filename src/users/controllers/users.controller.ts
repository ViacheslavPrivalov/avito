import { Body, Controller, Get, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { UserEntity } from "../model/User.entity";
import { User } from "src/auth/decorators/user.decorator";

@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("set_password")
  setPassword(@Body() newPassword: NewPassword, @User() user: UserEntity): Promise<void> {
    return this.usersService.setPassword(newPassword, user);
  }

  @Get("me")
  getUser(@User() user: UserEntity) {
    return this.usersService.getUser(user);
  }

  @Patch("me")
  updateUser(@Body() updateUser: UpdateUser, @User() user: UserEntity): Promise<UpdateUser> {
    return this.usersService.updateUser(updateUser, user);
  }

  @Patch("me/image")
  @UseInterceptors(FileInterceptor("image"))
  updateUserImage(@UploadedFile() image: Express.Multer.File, @User() user: UserEntity): Promise<void> {
    return this.usersService.updateUserImage(image, user);
  }
}
