import { IsEmail, IsEnum, IsString, Length, Matches } from "class-validator";
import { Role } from "src/users/model/User.entity";

export class Register {
  @Length(4, 32, { message: "Ваш email должен быть от 4 до 32 символов" })
  @IsEmail({}, { message: "Введите корректный email" })
  readonly username: string;

  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly password: string;

  @IsString()
  @Length(2, 16, { message: "Имя должно быть от 2 до 16 символов" })
  readonly firstName: string;

  @IsString()
  @Length(2, 16, { message: "Фамилия должна быть от 2 до 16 символов" })
  readonly lastName: string;

  @IsString()
  @Matches(/\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}/, { message: "Введите корректный номер телефона" })
  readonly phone: string;

  @IsEnum(Role)
  readonly role: Role;
}
