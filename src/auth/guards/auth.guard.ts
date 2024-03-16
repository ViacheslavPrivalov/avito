import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from "@nestjs/common";
import { UsersService } from "src/users/services/users.service";
import * as bcrypt from "bcrypt";
import { Reflector } from "@nestjs/core";

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private usersService: UsersService,
    private reflector: Reflector
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const isPublic = this.reflector.get<boolean>(
      "isPublic",
      context.getHandler()
    );

    if (isPublic) return true;

    const req = context.switchToHttp().getRequest();
    const authHeader = req.headers.authorization;

    const [scheme, credentials] = authHeader.split(" ");

    try {
      if (scheme !== "Basic" || !credentials)
        throw new Error("Пользователь не авторизован");

      const decodedCredentials = atob(credentials);
      const [username, password] = decodedCredentials.split(":");

      const user = await this.verifyUser(username, password);
      req.user = user;
      return true;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }
  }

  private async verifyUser(username: string, password: string) {
    const user = await this.usersService.getUserByUsername(username);

    if (!user) throw new Error("Пользователь не был найден");

    const isValidPassword = await bcrypt.compare(password, user.password);

    if (!isValidPassword)
      throw new Error("Не удалось верифицировать пользователя");

    return user;
  }
}