import { HttpException, HttpStatus } from "@nestjs/common";

export class AuthorizationException extends HttpException {
  constructor(errorText?: string) {
    super(
      {
        message: errorText,
        status: HttpStatus.UNAUTHORIZED,
        error: "Ошибка авторизации",
      },
      HttpStatus.UNAUTHORIZED
    );
  }
}
