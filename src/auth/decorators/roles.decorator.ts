import { SetMetadata } from "@nestjs/common";
import { Role } from "../../users/model/user.entity";

export const Roles = (role: Role) => SetMetadata("roles", role);
