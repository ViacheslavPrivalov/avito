import { Ad } from "../dto/ad.dto";
import { Ads } from "../dto/ads.dto";
import { ExtendedAd } from "../dto/extended-ad.dto";
import { AdEntity } from "../model/ad.entity";

export class AdsMapper {
  toAdDto(adEntity: AdEntity): Ad {
    const dto: Ad = {
      author: adEntity.author.id,
      image: adEntity.photo,
      pk: adEntity.id,
      price: adEntity.price,
      title: adEntity.title,
    };

    return dto;
  }

  toAdsDto(count: number, entities: AdEntity[]): Ads {
    const ads: Ad[] = entities.map((entity) => this.toAdDto(entity));

    const dto: Ads = {
      count,
      results: [...ads],
    };

    return dto;
  }

  toExtendedAdDto(adEntity: AdEntity): ExtendedAd {
    const dto: ExtendedAd = {
      pk: adEntity.id,
      authorFirstName: adEntity.author.firstName,
      authorLastName: adEntity.author.lastName,
      description: adEntity.description,
      email: adEntity.author.username,
      image: adEntity.photo,
      phone: adEntity.author.phone,
      price: adEntity.price,
      title: adEntity.title,
    };

    return dto;
  }
}
