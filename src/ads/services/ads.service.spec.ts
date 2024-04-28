import { TestBed } from "@automock/jest";
import { AdsService } from "./ads.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ImagesService } from "../../files/services/images.service";
import { AdsMapper } from "../mappers/ads.mapper";
import { AdEntity } from "../model/ad.entity";
import { Ads } from "../dto/ads.dto";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";
import { UserEntity } from "../../users/model/user.entity";
import { Ad } from "../dto/ad.dto";
import { ExtendedAd } from "../dto/extended-ad.dto";
import { Action, AppAbility, CaslAbilityFactory } from "../../auth/services/casl-ability.factory";
import { AdNotFoundException } from "../../validation/exceptions/ad-not-found.exception";
import { AccessNotAllowedException } from "../../validation/exceptions/access-not-allowed.exception";

describe("AdsService", () => {
  let adsService: AdsService;
  let repository: jest.Mocked<Repository<AdEntity>>;
  let mapper: jest.Mocked<AdsMapper>;
  let imagesService: jest.Mocked<ImagesService>;
  let casl: jest.Mocked<CaslAbilityFactory>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(AdsService).compile();

    adsService = unit;
    repository = unitRef.get(getRepositoryToken(AdEntity) as string);
    mapper = unitRef.get(AdsMapper);
    imagesService = unitRef.get(ImagesService);
    casl = unitRef.get(CaslAbilityFactory);
  });

  describe("getAllAds", () => {
    it("should return all ads", async () => {
      const result = new Ads();
      repository.findAndCount.mockResolvedValueOnce([[], 0]);
      mapper.toAdsDto.mockReturnValueOnce(new Ads());
      expect(await adsService.getAllAds()).toEqual(result);
    });
  });

  describe("addAd", () => {
    it("should add an ad", async () => {
      const user = new UserEntity();
      const properties = new CreateOrUpdateAd();
      const image: Express.Multer.File = {} as any;
      const adEntity = new AdEntity();

      imagesService.saveImage.mockResolvedValueOnce({ id: 1 } as any);
      repository.create.mockReturnValueOnce(adEntity);
      repository.save.mockResolvedValueOnce(undefined);
      mapper.toAdDto.mockReturnValueOnce(new Ad());

      const result = await adsService.addAd(properties, image, user);

      expect(result).toBeInstanceOf(Ad);
      expect(imagesService.saveImage).toHaveBeenCalledWith(image);
      expect(repository.create).toHaveBeenCalledWith({
        ...properties,
        photo: "/image/1",
        author: user,
      });
      expect(repository.save).toHaveBeenCalledWith(adEntity);
      expect(mapper.toAdDto).toHaveBeenCalledWith(adEntity);
    });
  });

  describe("getAdsMe", () => {
    it("should return ads of the user", async () => {
      const user = new UserEntity();
      user.id = 1;
      const adEntity = new AdEntity();
      adEntity.authorId = user.id;

      repository.findAndCount.mockResolvedValueOnce([[adEntity], 1]);
      mapper.toAdsDto.mockReturnValueOnce(new Ads());

      const result = await adsService.getAdsMe(user);

      expect(result).toBeInstanceOf(Ads);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        relations: { author: true },
        where: {
          authorId: user.id,
        },
      });
      expect(mapper.toAdsDto).toHaveBeenCalledWith(1, [adEntity]);
    });
  });

  describe("getAds", () => {
    it("should return an ad by id", async () => {
      const adEntity = new AdEntity();
      adEntity.id = 1;

      jest.spyOn(adsService, "getAdById").mockResolvedValueOnce(adEntity);
      mapper.toExtendedAdDto.mockReturnValueOnce(new ExtendedAd());

      const result = await adsService.getAds(adEntity.id);

      expect(result).toBeInstanceOf(ExtendedAd);
      expect(adsService.getAdById).toHaveBeenCalledWith(adEntity.id);
      expect(mapper.toExtendedAdDto).toHaveBeenCalledWith(adEntity);
    });
  });

  describe("removeAd", () => {
    it("should remove an ad", async () => {
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const adEntity = new AdEntity();
      adEntity.id = 1;
      adEntity.authorId = userEntity.id;
      adEntity.photo = "/image/1";

      jest.spyOn(adsService, "getAdById").mockResolvedValueOnce(adEntity);
      jest.spyOn(adsService as any, "isAllowed").mockReturnValueOnce(undefined);
      imagesService.deleteImage.mockResolvedValueOnce(undefined);
      repository.remove.mockResolvedValueOnce(undefined);

      await adsService.removeAd(adEntity.id, userEntity);

      expect(adsService.getAdById).toHaveBeenCalledWith(adEntity.id);
      expect((adsService as any).isAllowed).toHaveBeenCalledWith(Action.Delete, adEntity, userEntity);
      expect(imagesService.deleteImage).toHaveBeenCalledWith(1);
      expect(repository.remove).toHaveBeenCalledWith(adEntity);
    });
  });

  describe("updateAds", () => {
    it("should update an ad", async () => {
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const adEntity = new AdEntity();
      adEntity.id = 1;
      adEntity.authorId = userEntity.id;
      const createOrUpdateAdDto = new CreateOrUpdateAd();

      jest.spyOn(adsService, "getAdById").mockResolvedValueOnce(adEntity);
      jest.spyOn(adsService as any, "isAllowed").mockReturnValueOnce(undefined);
      repository.save.mockResolvedValueOnce(undefined);
      mapper.toAdDto.mockReturnValueOnce(new Ad());

      const result = await adsService.updateAds(adEntity.id, createOrUpdateAdDto, userEntity);

      expect(result).toBeInstanceOf(Ad);
      expect(adsService.getAdById).toHaveBeenCalledWith(adEntity.id);
      expect((adsService as any).isAllowed).toHaveBeenCalledWith(Action.Update, adEntity, userEntity);
      expect(repository.save).toHaveBeenCalledWith(adEntity);
      expect(mapper.toAdDto).toHaveBeenCalledWith(adEntity);
    });
  });

  describe("updateImage", () => {
    it("should update an image of an ad", async () => {
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const adEntity = new AdEntity();
      adEntity.id = 1;
      adEntity.authorId = userEntity.id;
      adEntity.photo = "/image/1";
      const image = {} as any;

      jest.spyOn(adsService, "getAdById").mockResolvedValueOnce(adEntity);
      jest.spyOn(adsService as any, "isAllowed").mockReturnValueOnce(undefined);
      imagesService.updateImage.mockResolvedValueOnce(image);

      image.data = Buffer.from("");
      const result = await adsService.updateImage(adEntity.id, image, userEntity);

      expect(result).toBe(image.data);
      expect(adsService.getAdById).toHaveBeenCalledWith(adEntity.id);
      expect((adsService as any).isAllowed).toHaveBeenCalledWith(Action.Update, adEntity, userEntity);
      expect(imagesService.updateImage).toHaveBeenCalledWith(1, image);
    });
  });

  describe("getAdById", () => {
    it("should return an ad by id", async () => {
      const adEntity = new AdEntity();
      adEntity.id = 1;

      repository.findOne.mockResolvedValueOnce(adEntity);

      const result = await adsService.getAdById(adEntity.id);

      expect(result).toBeInstanceOf(AdEntity);
      expect(result).toHaveProperty("id", 1);
    });

    it("should throw an exception if ad not found", async () => {
      const id = 1;

      repository.findOne.mockResolvedValueOnce(undefined);

      await expect(adsService.getAdById(id)).rejects.toThrow(AdNotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        relations: { author: true },
        where: {
          id,
        },
      });
    });
  });

  describe("isAllowed", () => {
    it("should allow action", () => {
      const action1 = Action.Update;
      const action2 = Action.Delete;
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const adEntity = new AdEntity();
      adEntity.id = 1;
      adEntity.authorId = userEntity.id;
      const ability = { can: jest.fn().mockReturnValue(true) } as unknown as AppAbility;

      casl.createForUser.mockReturnValue(ability);

      expect(() => (adsService as any).isAllowed(action1, adEntity, userEntity)).not.toThrow();
      expect(() => (adsService as any).isAllowed(action2, adEntity, userEntity)).not.toThrow();
    });

    it("should throw an exception if action is not allowed", () => {
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const adEntity = new AdEntity();
      adEntity.id = 1;
      adEntity.authorId = userEntity.id + 1;
      const ability = { can: jest.fn().mockReturnValue(false) } as unknown as AppAbility;

      casl.createForUser.mockReturnValue(ability);

      expect(() => (adsService as any).isAllowed(Action.Create, adEntity, userEntity)).toThrow(
        AccessNotAllowedException
      );
      expect(() => (adsService as any).isAllowed(Action.Update, adEntity, userEntity)).toThrow(
        "У вас нет прав доступа или объявление вам не принадлежит"
      );
      expect(() => (adsService as any).isAllowed(Action.Delete, adEntity, userEntity)).toThrow(
        "У вас нет прав доступа или объявление вам не принадлежит"
      );
    });
  });
});
