import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Res,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from "@nestjs/common";
import { AdsService } from "../services/ads.service";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";
import { ExtendedAd } from "../dto/extended-ad.dto";
import { Ads } from "../dto/ads.dto";
import { Ad } from "../dto/ad.dto";
import { ApiBasicAuth, ApiBody, ApiConsumes, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { Response } from "express";
import { Public } from "../../auth/decorators/public.decorator";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { UserEntity } from "../../users/model/User.entity";
import { ParseIdPipe } from "../../validation/pipes/parse-id.pipe";
import { User } from "../../auth/decorators/user.decorator";

@ApiTags("Объявления")
@ApiBasicAuth()
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

  // Фронтэнд отправляет properties как строку JSON внутри объекта Blob.
  // Но по спецификации бекэнд должен получить properties как объект, а не как строку.
  // Поэтому изменил код бэкенда, чтобы он мог работать с фронтэндом.
  // Код, соответствующий спецификации, находится в ветке open-api_match

  @Post()
  @ApiOperation({ summary: "Добавление объявления" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      required: ["image", "properties"],
      type: "object",
      properties: {
        properties: { type: "string", format: "binary" },
        image: { type: "string", format: "binary" },
      },
    },
  })
  @ApiResponse({ status: 201, description: "Created", type: Ad })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: "image", maxCount: 1 },
      { name: "properties", maxCount: 1 },
    ])
  )
  async addAd(
    @UploadedFiles() files: { image: Express.Multer.File[]; properties: Express.Multer.File[] },
    @User() user: UserEntity
  ): Promise<Ad> {
    const imageFile = files.image[0];
    const propertiesFile = files.properties[0];

    const properties: CreateOrUpdateAd = JSON.parse(propertiesFile.buffer.toString());

    return this.adsService.addAd(properties, imageFile, user);
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
  async updateImage(
    @Param("id") id: number,
    @UploadedFile() image: Express.Multer.File,
    @User() user: UserEntity,
    @Res() res: Response
  ): Promise<void> {
    const data = await this.adsService.updateImage(id, image, user);

    res.writeHead(200, {
      "Content-Length": Buffer.byteLength(data),
      "Content-Type": "image/jpeg",
    });

    res.end(data);
  }
}
