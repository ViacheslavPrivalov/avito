import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
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
import { ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags, getSchemaPath } from "@nestjs/swagger";

@ApiTags("Объявления")
@UseGuards(AuthGuard)
@Controller("ads")
export class AdsController {
  constructor(private adsService: AdsService) {}

  @Get()
  @Public()
  @ApiOperation({ summary: "Получение всех объявлений" })
  @ApiResponse({ status: 200, description: "OK" })
  getAllAds(): Promise<Ads> {
    return this.adsService.getAllAds();
  }

  @Post()
  @ApiOperation({ summary: "Добавление объявления" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      required: ["image", "properties"],
      type: "object",
      properties: {
        properties: { $ref: getSchemaPath(CreateOrUpdateAd) },
        image: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Created" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseInterceptors(FileInterceptor("image"))
  addAd(
    @Body() properties: CreateOrUpdateAd,
    @UploadedFile() image: Express.Multer.File,
    @User() user: UserEntity
  ): Promise<Ad> {
    return this.adsService.addAd(properties, image, user);
  }

  @Get("me")
  @ApiOperation({ summary: "Получение объявлений авторизованного пользователя" })
  @ApiResponse({ status: 200, description: "OK", type: Ads })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  getAdsMe(@User() user: UserEntity): Promise<Ads> {
    return this.adsService.getAdsMe(user);
  }

  @Get(":id")
  @ApiOperation({ summary: "Получение информации об объявлении" })
  @ApiParam({ name: "id", required: true })
  @ApiResponse({ status: 200, description: "OK", type: ExtendedAd })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not found" })
  getAds(@Param("id", ParseIdPipe) id: number): Promise<ExtendedAd> {
    return this.adsService.getAds(id);
  }

  @Delete(":id")
  @HttpCode(204)
  @ApiOperation({ summary: "Удаление объявления" })
  @ApiParam({ name: "id", required: true })
  @ApiResponse({ status: 204, description: "No Content" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  removeAd(@Param("id", ParseIdPipe) id: number, @User() user: UserEntity): Promise<void> {
    return this.adsService.removeAd(id, user);
  }

  @Patch(":id")
  @ApiOperation({ summary: "Обновление информации об объявлении" })
  @ApiParam({ name: "id", required: true })
  @ApiBody({ type: CreateOrUpdateAd })
  @ApiResponse({ status: 200, description: "OK", type: Ad })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  updateAds(
    @Param("id", ParseIdPipe) id: number,
    @Body() dto: CreateOrUpdateAd,
    @User() user: UserEntity
  ): Promise<Ad> {
    return this.adsService.updateAds(id, dto, user);
  }

  @Patch(":id/image")
  @ApiOperation({ summary: "Обновление картинки объявления" })
  @ApiParam({ name: "id", required: true })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      required: ["image"],
      type: "object",
      properties: {
        image: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: "OK",
    content: {
      "application/octet-stream": {
        schema: {
          type: "array",
          items: { type: "string", format: "byte" },
        },
      },
    },
  })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  @UseInterceptors(FileInterceptor("image"))
  updateImage(
    @Param("id") id: number,
    @UploadedFile() image: Express.Multer.File,
    @User() user: UserEntity
  ): Promise<Buffer> {
    return this.adsService.updateImage(id, image, user);
  }
}
