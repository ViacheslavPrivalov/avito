import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";
import { UserEntity } from "src/users/model/User.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { AdEntity } from "../model/ad.entity";
import { Repository } from "typeorm";
import { AdsMapper } from "../mappers/ads.mapper";
import { Ad } from "../dto/ad.dto";
import { Ads } from "../dto/ads.dto";
import { ExtendedAd } from "../dto/extended-ad.dto";
import { ImagesService } from "src/files/services/images.service";

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(AdEntity) private adsRepository: Repository<AdEntity>,
    private adsMapper: AdsMapper,
    private imagesService: ImagesService
  ) {}

  async getAllAds(): Promise<Ads> {
    const [entities, count] = await this.adsRepository.findAndCount({ relations: { author: true } });

    return this.adsMapper.toAdsDto(count, entities);
  }

  async addAd(properties: CreateOrUpdateAd, image: Express.Multer.File, user: UserEntity): Promise<Ad> {
    const filename = this.imagesService.createFilename(image);

    const newAd = this.adsRepository.create({
      ...properties,
      image: "/" + filename,
      author: user,
    });

    await this.adsRepository.save(newAd);

    const dto: Ad = this.adsMapper.toAdDto(newAd);
    return dto;
  }

  async getAdsMe(user: UserEntity): Promise<Ads> {
    const [entities, count] = await this.adsRepository.findAndCount({
      relations: { author: true },
      where: {
        authorId: user.id,
      },
    });

    return this.adsMapper.toAdsDto(count, entities);
  }

  async getAds(id: number): Promise<ExtendedAd> {
    const adEntity = await this.getAdByIdForUser(id);

    return this.adsMapper.toExtendedAdDto(adEntity);
  }

  async removeAd(id: number) {
    const adEntity = await this.getAdByIdForUser(id);

    await this.adsRepository.remove(adEntity);
  }

  async updateAds(id: number, dto: CreateOrUpdateAd) {
    const adEntity = await this.getAdByIdForUser(id);

    for (const prop in dto) {
      adEntity[prop] = dto[prop];
    }

    await this.adsRepository.save(adEntity);

    return this.adsMapper.toAdDto(adEntity);
  }

  async updateImage(id: number, image: Express.Multer.File) {
    const adEntity = await this.getAdByIdForUser(id);

    const filename = this.imagesService.createFilename(image);

    adEntity.image = "/" + filename;

    await this.adsRepository.save(adEntity);

    return image.buffer;
  }

  public async getAdByIdForUser(id: number): Promise<AdEntity> {
    const adEntity = await this.adsRepository.findOne({
      relations: { author: true },
      where: {
        id,
      },
    });

    if (!adEntity) throw new NotFoundException("Объявление не было найдено");

    return adEntity;
  }
}
