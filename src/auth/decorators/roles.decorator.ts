import { SetMetadata } from "@nestjs/common";
import { Role } from "src/users/model/Role.enum";

export const Roles = (role: Role) => SetMetadata("roles", role);
