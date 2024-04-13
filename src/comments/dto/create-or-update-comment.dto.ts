import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class CreateOrUpdateComment {
  @ApiProperty({ description: "текст комментария" })
  @IsString()
  @Length(8, 64, { message: "Комментарий должен быть от 8 до 64 символов" })
  readonly text: string;
}
