import { Injectable } from "@nestjs/common";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";

@Injectable()
export class AdsService {
  updateImage(id: number, image: any) {
    throw new Error("Method not implemented.");
  }
  getAdsMe() {
    throw new Error("Method not implemented.");
  }
  updateAds(id: number, dto: CreateOrUpdateAd) {
    throw new Error("Method not implemented.");
  }
  removeAd(id: number) {
    throw new Error("Method not implemented.");
  }
  getAds(id: number) {
    throw new Error("Method not implemented.");
  }
  addAd(properties: CreateOrUpdateAd, image: any) {
    throw new Error("Method not implemented.");
  }
  getAllAds() {
    throw new Error("Method not implemented.");
  }
}
