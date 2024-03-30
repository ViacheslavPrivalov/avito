import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class Login {
  @ApiProperty({ description: "логин" })
  @IsString()
  @Length(4, 32, { message: "Ваш email должен быть от 4 до 32 символов" })
  readonly username: string;

  @ApiProperty({ description: "пароль" })
  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly password: string;
}
