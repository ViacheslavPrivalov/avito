import { Module } from "@nestjs/common";
import { AdsController } from "./controllers/ads.controller";
import { AdsService } from "./services/ads.service";

@Module({
  controllers: [AdsController],
  providers: [AdsService],
})
export class AdsModule {}
