import { Body, Controller, Get, Patch, Post, Request, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { User } from "../dto/user.dto";

@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("set_password")
  setPassword(@Body() newPassword: NewPassword, @Request() req) {
    return this.usersService.setPassword(newPassword, req.user);
  }

  @Get("me")
  getUser(@Request() req): User {
    return this.usersService.getUser(req.user);
  }

  @Patch("me")
  updateUser(@Body() updateUser: UpdateUser, @Request() req): Promise<UpdateUser> {
    return this.usersService.updateUser(updateUser, req.user);
  }

  @Patch("me/image")
  @UseInterceptors(FileInterceptor("image"))
  updateUserImage(@UploadedFile() image: Express.Multer.File, @Request() req) {
    return this.usersService.updateUserImage(image, req.user);
  }
}
