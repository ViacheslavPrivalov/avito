import { Role } from "../model/Role.enum";

export class User {
  readonly id: number;
  readonly email: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly role: Role;
  readonly image: string;
}
