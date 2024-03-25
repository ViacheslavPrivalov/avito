import { Module, forwardRef } from "@nestjs/common";
import { AuthController } from "./controllers/auth.controller";
import { AuthService } from "./services/auth.service";
import { UsersModule } from "src/users/users.module";
import { AdsModule } from "src/ads/ads.module";
import { CaslAbilityFactory } from "./services/casl-ability.factory";

@Module({
  controllers: [AuthController],
  providers: [AuthService, CaslAbilityFactory],
  imports: [UsersModule],
  exports: [CaslAbilityFactory],
})
export class AuthModule {}
