import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Request,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AdsService } from "../services/ads.service";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Public } from "src/auth/decorators/public.decorator";
import { ExtendedAd } from "../dto/extended-ad.dto";

@UseGuards(AuthGuard)
@Controller("ads")
export class AdsController {
  constructor(private adsService: AdsService) {}

  @Get()
  @Public()
  getAllAds() {
    return this.adsService.getAllAds();
  }

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  addAd(@Body() properties: CreateOrUpdateAd, @UploadedFile() image: Express.Multer.File, @Request() req) {
    return this.adsService.addAd(properties, image, req.user);
  }

  @Get("me")
  getAdsMe(@Request() req) {
    return this.adsService.getAdsMe(req.user);
  }

  @Get(":id")
  getAds(@Param("id", ParseIntPipe) id: number): Promise<ExtendedAd> {
    return this.adsService.getAds(id);
  }

  @Delete(":id")
  async removeAd(@Param("id", ParseIntPipe) id: number, @Request() req) {
    return this.adsService.removeAd(id, req.user);
  }

  @Patch(":id")
  updateAds(@Param("id", ParseIntPipe) id: number, @Body() dto: CreateOrUpdateAd, @Request() req) {
    return this.adsService.updateAds(id, dto, req.user);
  }

  @Patch(":id/image")
  @UseInterceptors(FileInterceptor("image"))
  updateImage(@Param("id") id: number, @UploadedFile() image: Express.Multer.File, @Request() req) {
    return this.adsService.updateImage(id, image, req.user);
  }
}
