import { Module, forwardRef } from "@nestjs/common";
import { AdsController } from "./controllers/ads.controller";
import { AdsService } from "./services/ads.service";
import { AdsMapper } from "./mappers/ads.mapper";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdEntity } from "./model/ad.entity";
import { AuthModule } from "../auth/auth.module";
import { FilesModule } from "../files/files.module";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [AdsController],
  providers: [AdsService, AdsMapper],
  imports: [TypeOrmModule.forFeature([AdEntity]), UsersModule, FilesModule, AuthModule],
  exports: [AdsService],
})
export class AdsModule {}
