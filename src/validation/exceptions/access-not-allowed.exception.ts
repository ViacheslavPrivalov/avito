import { HttpException, HttpStatus } from "@nestjs/common";

export class AccessNotAllowedException extends HttpException {
  constructor(errorText: string = "У вас нет прав доступа") {
    super(
      {
        message: errorText,
        status: HttpStatus.FORBIDDEN,
        error: "Ошибка доступа",
      },
      HttpStatus.FORBIDDEN
    );
  }
}
