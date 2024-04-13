import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length, Matches } from "class-validator";

export class UpdateUser {
  @ApiProperty({ description: "имя пользователя" })
  @IsString()
  @Length(3, 10, { message: "Имя должно быть от 3 до 10 символов" })
  readonly firstName: string;

  @ApiProperty({ description: "фамилия пользователя" })
  @IsString()
  @Length(3, 10, { message: "Фамилия должна быть от 3 до 10 символов" })
  readonly lastName: string;

  @ApiProperty({ description: "телефон пользователя" })
  @IsString()
  @Matches(/\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}/, { message: "Введите корректный номер телефона" })
  readonly phone: string;
}
