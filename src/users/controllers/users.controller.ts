import {
  Body,
  Controller,
  Get,
  HttpCode,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { UsersService } from "../services/users.service";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { User } from "../dto/user.dto";
import { ApiBasicAuth, ApiBody, ApiConsumes, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";

@ApiTags("Пользователи")
@ApiBasicAuth()
@UseGuards(AuthGuard)
@Controller("users")
export class UsersController {
  constructor(private usersService: UsersService) {}

  @Post("set_password")
  @HttpCode(200)
  @ApiOperation({ summary: "Обновление пароля" })
  @ApiBody({ type: NewPassword })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  setPassword(@Body() newPassword: NewPassword, @Request() req): Promise<void> {
    return this.usersService.setPassword(newPassword, req.user);
  }

  @Get("me")
  @ApiOperation({ summary: "Получение информации об авторизованном пользователе" })
  @ApiResponse({ status: 200, description: "OK", type: User })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getUser(@Request() req): User {
    return this.usersService.getUser(req.user);
  }

  @Patch("me")
  @ApiOperation({ summary: "Обновление информации об авторизованном пользователе" })
  @ApiBody({ type: UpdateUser })
  @ApiResponse({ status: 200, description: "OK", type: UpdateUser })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  updateUser(@Body() updateUser: UpdateUser, @Request() req): Promise<UpdateUser> {
    return this.usersService.updateUser(updateUser, req.user);
  }

  @Patch("me/image")
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      required: ["image"],
      type: "object",
      properties: {
        image: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  @ApiOperation({ summary: "Обновление аватара авторизованного пользователя" })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseInterceptors(FileInterceptor("image"))
  updateUserImage(@UploadedFile() image: Express.Multer.File, @Request() req): Promise<void> {
    return this.usersService.updateUserImage(image, req.user);
  }
}
