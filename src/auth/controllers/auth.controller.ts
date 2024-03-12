import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { Register } from "../dto/register.dto";
import { Login } from "../dto/login.dto";

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  register(@Body() dto: Register) {
    return this.authService.register(dto);
  }

  @Post("login")
  login(@Body() dto: Login) {
    return this.authService.login(dto);
  }
}
