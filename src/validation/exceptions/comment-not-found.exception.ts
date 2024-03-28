import { HttpException, HttpStatus } from "@nestjs/common";

export class CommentNotFoundException extends HttpException {
  constructor() {
    super(
      {
        message: "Комментарий не был найден",
        status: HttpStatus.NOT_FOUND,
        error: "Ошибка поиска",
      },
      HttpStatus.NOT_FOUND
    );
  }
}
