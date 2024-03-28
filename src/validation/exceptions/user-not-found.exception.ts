import { HttpException, HttpStatus } from "@nestjs/common";

export class UserNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: "Пользователь с таким email не был найден",
        status: HttpStatus.NOT_FOUND,
        error: "Ошибка поиска",
      },
      HttpStatus.NOT_FOUND
    );
  }
}
