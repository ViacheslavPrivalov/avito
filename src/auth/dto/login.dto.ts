import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length } from "class-validator";

export class Login {
  @ApiProperty({ description: "логин" })
  @Length(4, 32, { message: "Ваш email должен быть от 4 до 32 символов" })
  @IsEmail({}, { message: "Введите корректный email" })
  readonly username: string;

  @ApiProperty({ description: "пароль" })
  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly password: string;
}
