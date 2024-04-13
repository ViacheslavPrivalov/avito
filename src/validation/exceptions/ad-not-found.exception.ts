import { HttpException, HttpStatus } from "@nestjs/common";

export class AdNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: "Объявление не было найдено",
        status: HttpStatus.NOT_FOUND,
        error: "Ошибка поиска",
      },
      HttpStatus.NOT_FOUND
    );
  }
}
