import { ApiProperty } from "@nestjs/swagger";
import { IsString, Length } from "class-validator";

export class NewPassword {
  @ApiProperty({ description: "текущий пароль" })
  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly currentPassword: string;

  @ApiProperty({ description: "новый пароль" })
  @IsString()
  @Length(8, 16, { message: "Пароль должен быть от 8 до 16 символов" })
  readonly newPassword: string;
}
