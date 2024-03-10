import { Module } from '@nestjs/common';
import { AdsController } from './controllers/ads/ads.controller';
import { AdsService } from './services/ads/ads.service';

@Module({
  controllers: [AdsController],
  providers: [AdsService]
})
export class AdsModule {}
