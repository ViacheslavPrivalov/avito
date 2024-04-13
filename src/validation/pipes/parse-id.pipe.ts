import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";

@Injectable()
export class ParseIdPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const id = parseInt(value);

    if (isNaN(id)) throw new BadRequestException("Введите корректный id");

    if (id <= 0) throw new BadRequestException("Введите положительный id");

    return id;
  }
}
