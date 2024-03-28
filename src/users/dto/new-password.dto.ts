import { IsString, Length } from "class-validator";

export class NewPassword {
  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly currentPassword: string;

  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly newPassword: string;
}
