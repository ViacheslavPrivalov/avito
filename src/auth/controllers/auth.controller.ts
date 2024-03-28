import { Body, Controller, HttpCode, Post, UseFilters, UsePipes } from "@nestjs/common";
import { AuthService } from "../services/auth.service";
import { Register } from "../dto/register.dto";
import { Login } from "../dto/login.dto";
import { ValidationPipe } from "src/validation/pipes/validation.pipe";
import { AllExceptionsFilter } from "src/validation/filters/allExceptions.filter";

@Controller()
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post("register")
  @UsePipes(ValidationPipe)
  register(@Body() dto: Register) {
    throw new Error("random error");
    return this.authService.register(dto);
  }

  @Post("login")
  @HttpCode(200)
  login(@Body() dto: Login) {
    return this.authService.login(dto);
  }
}
