import { Injectable } from "@nestjs/common";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { AdEntity } from "../model/ad.entity";
import { Repository } from "typeorm";
import { AdsMapper } from "../mappers/ads.mapper";
import { Ad } from "../dto/ad.dto";
import { Ads } from "../dto/ads.dto";
import { ExtendedAd } from "../dto/extended-ad.dto";
import { UserEntity } from "../../users/model/User.entity";
import { ImagesService } from "../../files/services/images.service";
import { Action, CaslAbilityFactory } from "../../auth/services/casl-ability.factory";
import { AccessNotAllowedException } from "../../validation/exceptions/access-not-allowed.exception";
import { AdNotFoundException } from "../../validation/exceptions/ad-not-found.exception";

@Injectable()
export class AdsService {
  constructor(
    @InjectRepository(AdEntity) private adsRepository: Repository<AdEntity>,
    private caslAbilityFactory: CaslAbilityFactory,
    private adsMapper: AdsMapper,
    private imagesService: ImagesService
  ) {}

  async getAllAds(): Promise<Ads> {
    const [entities, count] = await this.adsRepository.findAndCount({ relations: { author: true } });

    return this.adsMapper.toAdsDto(count, entities);
  }

  async addAd(properties: CreateOrUpdateAd, image: Express.Multer.File, user: UserEntity): Promise<Ad> {
    const adImage = await this.imagesService.saveImage(image);

    const newAd = this.adsRepository.create({
      ...properties,
      photo: `/image/${adImage.id}`,
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
    const adEntity = await this.getAdById(id);

    return this.adsMapper.toExtendedAdDto(adEntity);
  }

  async removeAd(id: number, user: UserEntity): Promise<void> {
    const adEntity = await this.getAdById(id);

    this.isAllowed(Action.Delete, adEntity, user);

    const imageIdToDelete = Number(adEntity.photo.slice(-1));

    await this.imagesService.deleteImage(imageIdToDelete);

    await this.adsRepository.remove(adEntity);
  }

  async updateAds(id: number, dto: CreateOrUpdateAd, user: UserEntity): Promise<Ad> {
    const adEntity = await this.getAdById(id);

    this.isAllowed(Action.Update, adEntity, user);

    for (const prop in dto) {
      adEntity[prop] = dto[prop];
    }

    await this.adsRepository.save(adEntity);

    return this.adsMapper.toAdDto(adEntity);
  }

  async updateImage(id: number, image: Express.Multer.File, user: UserEntity): Promise<Buffer> {
    const adEntity = await this.getAdById(id);

    this.isAllowed(Action.Update, adEntity, user);

    const imageIdToUpdate = Number(adEntity.photo.slice(-1));
    const updatedAdImage = await this.imagesService.updateImage(imageIdToUpdate, image);

    return updatedAdImage.data;
  }

  public async getAdById(id: number): Promise<AdEntity> {
    const adEntity = await this.adsRepository.findOne({
      relations: { author: true },
      where: {
        id,
      },
    });

    if (!adEntity) throw new AdNotFoundException();

    return adEntity;
  }

  private isAllowed(action: Action, adEntity: AdEntity, user: UserEntity): void {
    const ability = this.caslAbilityFactory.createForUser(user);

    if (!ability.can(action, adEntity))
      throw new AccessNotAllowedException("У вас нет прав доступа или объявление вам не принадлежит");
  }
}
