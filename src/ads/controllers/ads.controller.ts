import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
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
import { User } from "src/auth/decorators/user.decorator";
import { UserEntity } from "src/users/model/User.entity";
import { ParseIdPipe } from "src/validation/pipes/parse-id.pipe";
import { Ads } from "../dto/ads.dto";
import { Ad } from "../dto/ad.dto";

@UseGuards(AuthGuard)
@Controller("ads")
export class AdsController {
  constructor(private adsService: AdsService) {}

  @Get()
  @Public()
  getAllAds(): Promise<Ads> {
    return this.adsService.getAllAds();
  }

  @Post()
  @UseInterceptors(FileInterceptor("image"))
  addAd(
    @Body() properties: CreateOrUpdateAd,
    @UploadedFile() image: Express.Multer.File,
    @User() user: UserEntity
  ): Promise<Ad> {
    return this.adsService.addAd(properties, image, user);
  }

  @Get("me")
  getAdsMe(@User() user: UserEntity): Promise<Ads> {
    return this.adsService.getAdsMe(user);
  }

  @Get(":id")
  getAds(@Param("id", ParseIdPipe) id: number): Promise<ExtendedAd> {
    return this.adsService.getAds(id);
  }

  @Delete(":id")
  removeAd(@Param("id", ParseIdPipe) id: number, @User() user: UserEntity): Promise<void> {
    return this.adsService.removeAd(id, user);
  }

  @Patch(":id")
  updateAds(
    @Param("id", ParseIdPipe) id: number,
    @Body() dto: CreateOrUpdateAd,
    @User() user: UserEntity
  ): Promise<Ad> {
    return this.adsService.updateAds(id, dto, user);
  }

  @Patch(":id/image")
  @UseInterceptors(FileInterceptor("image"))
  updateImage(
    @Param("id") id: number,
    @UploadedFile() image: Express.Multer.File,
    @User() user: UserEntity
  ): Promise<Buffer> {
    return this.adsService.updateImage(id, image, user);
  }
}
