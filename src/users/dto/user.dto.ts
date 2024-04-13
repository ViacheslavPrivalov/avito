import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../model/User.entity";

export class User {
  @ApiProperty({ description: "id пользователя" })
  readonly id: number;

  @ApiProperty({ description: "логин пользователя" })
  readonly email: string;

  @ApiProperty({ description: "имя пользователя" })
  readonly firstName: string;

  @ApiProperty({ description: "фамилия пользователя" })
  readonly lastName: string;

  @ApiProperty({ description: "телефон пользователя" })
  readonly phone: string;

  @ApiProperty({ enum: Role, description: "роль пользователя" })
  readonly role: Role;

  @ApiProperty({ description: "ссылка на аватар пользователя" })
  readonly image: string;
}
