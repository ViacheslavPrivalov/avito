import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  UploadedFile,
  UseInterceptors,
} from "@nestjs/common";
import { AdsService } from "../services/ads.service";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";
import { FileInterceptor } from "@nestjs/platform-express";

@Controller("ads")
export class AdsController {
  constructor(private adsService: AdsService) {}

  @Get()
  getAllAds() {
    return this.adsService.getAllAds();
  }

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  addAd(@Body() properties: CreateOrUpdateAd, @UploadedFile() image: any) {
    return this.adsService.addAd(properties, image);
  }

  @Get(":id")
  getAds(@Param("id") id: number) {
    return this.adsService.getAds(id);
  }

  @Delete(":id")
  removeAd(@Param("id") id: number) {
    return this.adsService.removeAd(id);
  }

  @Patch(":id")
  updateAds(@Param("id") id: number, @Body() dto: CreateOrUpdateAd) {
    return this.adsService.updateAds(id, dto);
  }

  @Get("me")
  getAdsMe() {
    return this.adsService.getAdsMe();
  }

  @Patch(":id/image")
  @UseInterceptors(FileInterceptor("image"))
  updateImage(@Param("id") id: number, @UploadedFile() image: any) {
    return this.adsService.updateImage(id, image);
  }
}
