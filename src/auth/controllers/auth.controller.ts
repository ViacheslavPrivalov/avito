import { Body, Controller, HttpCode, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { Register } from "../dto/register.dto";
import { Login } from "../dto/login.dto";
import { ApiBody, ApiOperation, ApiResponse, ApiTags } from "@nestjs/swagger";

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiTags("Регистрация")
  @Post("register")
  @ApiOperation({ summary: "Регистрация пользователя" })
  @ApiBody({ type: Register })
  @ApiResponse({ status: 201, description: "Created" })
  @ApiResponse({ status: 400, description: "Bad Request" })
  register(@Body() dto: Register): Promise<void> {
    return this.authService.register(dto);
  }

  @ApiTags("Авторизация")
  @Post("login")
  @ApiOperation({ summary: "Авторизация пользователя" })
  @ApiBody({ type: Login })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @HttpCode(200)
  login(@Body() dto: Login): Promise<void> {
    return this.authService.login(dto);
  }
}
