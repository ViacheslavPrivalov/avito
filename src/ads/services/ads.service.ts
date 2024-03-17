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

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(AdEntity) private adsRepository: Repository<AdEntity>,
    private adsMapper: AdsMapper
  ) {}

  async getAllAds(): Promise<Ads> {
    const [entities, count] = await this.adsRepository.findAndCount({ relations: { author: true } });

    return this.adsMapper.toAdsDto(count, entities);
  }

  async addAd(properties: CreateOrUpdateAd, image: any, user: UserEntity): Promise<Ad> {
    const newAd = this.adsRepository.create({
      ...properties,
      image: "",
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
        author: {
          id: user.id,
        },
      },
    });

    return this.adsMapper.toAdsDto(count, entities);
  }

  async getAds(id: number, user: UserEntity): Promise<ExtendedAd> {
    const adEntity = await this.getAdByIdForUser(id, user);

    return this.adsMapper.toExtendedAdDto(adEntity);
  }

  async removeAd(id: number, user: UserEntity) {
    const adEntity = await this.getAdByIdForUser(id, user);

    await this.adsRepository.remove(adEntity);
  }

  async updateAds(id: number, dto: CreateOrUpdateAd, user: UserEntity) {
    const adEntity = await this.getAdByIdForUser(id, user);

    for (const prop in dto) {
      adEntity[prop] = dto[prop];
    }

    await this.adsRepository.save(adEntity);

    return this.adsMapper.toAdDto(adEntity);
  }

  updateImage(id: number, image: any) {
    throw new Error("Method not implemented.");
  }

  private async getAdByIdForUser(id: number, user: UserEntity): Promise<AdEntity> {
    const adEntity = await this.adsRepository.findOne({
      relations: { author: true },
      where: {
        author: {
          id: user.id,
        },
        id,
      },
    });

    if (!adEntity) throw new NotFoundException("Объявление не было найдено");

    return adEntity;
  }
}
