import { IsString, Length } from "class-validator";

export class CreateOrUpdateComment {
  @IsString()
  @Length(8, 64, { message: "Комментарий должен быть от 8 до 64 символов" })
  readonly text: string;
}
