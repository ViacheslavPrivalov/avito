import { HttpException, HttpStatus } from "@nestjs/common";

export class ValidationException extends HttpException {
  constructor(errorText: string | string[]) {
    super(
      {
        message: errorText,
        status: HttpStatus.BAD_REQUEST,
        error: "Ошибка валидации",
      },
      HttpStatus.BAD_REQUEST
    );
  }
}
