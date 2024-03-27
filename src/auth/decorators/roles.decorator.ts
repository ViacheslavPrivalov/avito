import { SetMetadata } from "@nestjs/common";
import { Role } from "src/users/model/User.entity";

export const Roles = (role: Role) => SetMetadata("roles", role);
