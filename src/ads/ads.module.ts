import { Module } from "@nestjs/common";
import { AdsController } from "./controllers/ads.controller";
import { AdsService } from "./services/ads.service";
import { AdsMapper } from "./mappers/ads.mapper";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdEntity } from "./model/ad.entity";
import { UsersModule } from "src/users/users.module";

@Module({
  controllers: [AdsController],
  providers: [AdsService, AdsMapper],
  imports: [TypeOrmModule.forFeature([AdEntity]), UsersModule],
})
export class AdsModule {}
