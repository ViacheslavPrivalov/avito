import { Role } from "src/users/model/User.entity";

export class Register {
  readonly username: string;
  readonly password: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly role: Role;
}
