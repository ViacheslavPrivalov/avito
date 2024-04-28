import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsEnum, IsString, Length, Matches } from "class-validator";
import { Role } from "../../users/model/user.entity";

export class Register {
  @ApiProperty({ description: "логин" })
  @Length(4, 32, { message: "Ваш email должен быть от 4 до 32 символов" })
  @IsEmail({}, { message: "Введите корректный email" })
  readonly username: string;

  @ApiProperty({ description: "пароль" })
  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly password: string;

  @ApiProperty({ description: "имя пользователя" })
  @IsString()
  @Length(2, 16, { message: "Имя должно быть от 2 до 16 символов" })
  readonly firstName: string;

  @ApiProperty({ description: "фамилия пользователя" })
  @IsString()
  @Length(2, 16, { message: "Фамилия должна быть от 2 до 16 символов" })
  readonly lastName: string;

  @ApiProperty({ description: "телефон пользователя" })
  @IsString()
  @Matches(/\+7\s?\(?\d{3}\)?\s?\d{3}-?\d{2}-?\d{2}/, { message: "Введите корректный номер телефона" })
  readonly phone: string;

  @ApiProperty({ enum: Role, description: "роль пользователя" })
  @IsEnum(Role, { message: "неверно указана роль пользователя" })
  readonly role: Role;
}
