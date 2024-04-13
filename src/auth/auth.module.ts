import { Module } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { CaslAbilityFactory } from "./services/casl-ability.factory";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [AuthController],
  providers: [AuthService, CaslAbilityFactory],
  imports: [UsersModule],
  exports: [CaslAbilityFactory],
})
export class AuthModule {}
