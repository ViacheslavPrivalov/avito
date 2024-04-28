import { Test, TestingModule } from "@nestjs/testing";
import { AdsController } from "./ads.controller";
import { AdsService } from "../services/ads.service";
import { Ads } from "../dto/ads.dto";
import { Ad } from "../dto/ad.dto";
import { UserEntity } from "../../users/model/user.entity";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { CreateOrUpdateAd } from "../dto/create-or-update-ad.dto";
import { ExtendedAd } from "../dto/extended-ad.dto";
import { Response } from "express";

jest.mock("../services/ads.service");

const mockUser = new UserEntity();
const mockAd = new Ad();
const mockAds = new Ads();
const mockExtendedAd = new ExtendedAd();

const mockGuard = {};

describe("AdsController", () => {
  let controller: AdsController;
  let service: AdsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AdsController],
      providers: [AdsService],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<AdsController>(AdsController);
    service = module.get<AdsService>(AdsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should return all ads", async () => {
    (service.getAllAds as jest.Mock).mockResolvedValue(mockAds);

    const result = await controller.getAllAds();

    expect(result).toEqual(mockAds);
    expect(service.getAllAds).toHaveBeenCalled();
  });

  it("should add an ad", async () => {
    const mockFiles: { image: Express.Multer.File[]; properties: Express.Multer.File[] } = {
      image: [],
      properties: [
        {
          buffer: Buffer.from(JSON.stringify({ title: "", price: 0, description: "" })),
        } as unknown as Express.Multer.File,
      ],
    };

    const mockImage = mockFiles.image[0];
    const mockProperties: CreateOrUpdateAd = {
      title: "",
      price: 0,
      description: "",
    };

    (service.addAd as jest.Mock).mockResolvedValue(mockAd);

    const result = await controller.addAd(mockFiles, mockUser);

    expect(result).toEqual(mockAd);
    expect(service.addAd).toHaveBeenCalledWith(mockProperties, mockImage, mockUser);
  });

  it("should return ads of authorized user", async () => {
    (service.getAdsMe as jest.Mock).mockResolvedValue(mockAds);

    const result = await controller.getAdsMe(mockUser);

    expect(result).toEqual(mockAds);
    expect(service.getAdsMe).toHaveBeenCalledWith(mockUser);
  });

  it("should return ad by id", async () => {
    (service.getAds as jest.Mock).mockResolvedValue(mockExtendedAd);

    const result = await controller.getAds(expect.any(Number));

    expect(result).toEqual(mockExtendedAd);
    expect(service.getAds).toHaveBeenCalled();
  });

  it("should delete ad by id", async () => {
    (service.removeAd as jest.Mock).mockResolvedValue(undefined);

    await controller.removeAd(1, mockUser);
    expect(service.removeAd).toHaveBeenCalledWith(1, mockUser);
  });

  it("should update ad", async () => {
    const stub = new CreateOrUpdateAd();

    (service.updateAds as jest.Mock).mockResolvedValue(mockAd);

    const result = await controller.updateAds(1, stub, mockUser);

    expect(result).toEqual(mockAd);
    expect(service.updateAds).toHaveBeenCalledWith(1, stub, mockUser);
  });

  it("should update image of ad", async () => {
    const mockRes = { writeHead: jest.fn(), end: jest.fn() } as unknown as Response;
    const mockImage = {} as unknown as Express.Multer.File;

    (service.updateImage as jest.Mock).mockResolvedValue("mockData");

    await controller.updateImage(1, mockImage, mockUser, mockRes);

    expect(service.updateImage).toHaveBeenCalledWith(1, mockImage, mockUser);
    expect(mockRes.writeHead).toHaveBeenCalledWith(200, {
      "Content-Length": Buffer.byteLength("mockData"),
      "Content-Type": "image/jpeg",
    });
    expect(mockRes.end).toHaveBeenCalledWith("mockData");
  });
});
