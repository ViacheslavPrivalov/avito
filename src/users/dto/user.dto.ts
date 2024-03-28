import { IsEmail, IsInt, IsString, Min } from "class-validator";
import { Role } from "../model/User.entity";

export class User {
  @IsInt()
  readonly id: number;

  @IsEmail()
  readonly email: string;

  @IsString()
  readonly firstName: string;

  @IsString()
  readonly lastName: string;

  @IsString()
  readonly phone: string;
  readonly role: Role;
  readonly image: string;
}
