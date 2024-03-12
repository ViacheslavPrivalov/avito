import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("set-password")
  setPassword(@Body() newPassword: NewPassword) {
    return this.usersService.setPassword(newPassword);
  }

  @Get("me")
  getUser() {
    return this.usersService.getUser();
  }

  @Patch("me")
  updateUser(@Body() updateUser: UpdateUser) {
    return this.usersService.updateUser(updateUser);
  }

  @Patch("me/image")
  @UseInterceptors(FileInterceptor("image"))
  updateUserImage(@UploadedFile() image: any) {
    return this.usersService.updateUserImage(image);
  }
}
