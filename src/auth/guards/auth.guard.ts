import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Reflector } from "@nestjs/core";
import { UsersService } from "../../users/services/users.service";
import { AuthorizationException } from "../../validation/exceptions/authorization.exception";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private usersService: UsersService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>("isPublic", context.getHandler());

    if (isPublic) return true;

    try {
      const req = context.switchToHttp().getRequest();
      const authHeader = req.headers.authorization;

      if (!authHeader) throw new Error("Пользователь не авторизован");

      const [scheme, credentials] = authHeader.split(" ");

      if (scheme !== "Basic" || !credentials) throw new Error("Не удалось верифицировать пользователя");

      const decodedCredentials = Buffer.from(credentials, "base64").toString();
      const [username, password] = decodedCredentials.split(":");

      const user = await this.verifyUser(username, password);
      req.user = user;
      return true;
    } catch (error) {
      throw new AuthorizationException(error.message);
    }
  }

  private async verifyUser(username: string, password: string) {
    const user = await this.usersService.getUserByUsername(username);

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword) throw new Error("Неверный пароль");

    return user;
  }
}
