import { IsString, Length } from "class-validator";

export class Login {
  @IsString()
  @Length(4, 32, { message: "Ваш email должен быть от 4 до 32 символов" })
  readonly username: string;

  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly password: string;
}
