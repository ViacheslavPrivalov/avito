import { Test, TestingModule } from "@nestjs/testing";
import { ImagesService } from "./images.service";
import { Repository } from "typeorm";
import { ImageEntity } from "../model/image.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as fs from "fs/promises";

describe("ImagesService", () => {
  let service: ImagesService;
  let repository: Repository<ImageEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ImagesService,
        {
          provide: getRepositoryToken(ImageEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<ImagesService>(ImagesService);
    repository = module.get<Repository<ImageEntity>>(getRepositoryToken(ImageEntity));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe("saveImage", () => {
    it("should save an image and return the saved image entity", async () => {
      const testFile = {
        buffer: Buffer.from("test"),
      } as unknown as Express.Multer.File;

      const testImageEntity = new ImageEntity();
      testImageEntity.filename = "test.jpg";
      testImageEntity.data = testFile.buffer;

      jest.spyOn(service as any, "saveImageOnDisk").mockImplementation(() => Promise.resolve());
      jest.spyOn(repository, "create").mockReturnValue(testImageEntity);
      jest.spyOn(repository, "save").mockResolvedValue(testImageEntity);

      const result = await service.saveImage(testFile);

      expect(result).toEqual(testImageEntity);
      expect((service as any).saveImageOnDisk).toHaveBeenCalledWith(expect.any(String), testFile.buffer);
      expect(repository.create).toHaveBeenCalledWith({
        filename: expect.any(String),
        data: testFile.buffer,
      });
      expect(repository.save).toHaveBeenCalledWith(testImageEntity);
    });

    it("should throw an error if saving the image fails", async () => {
      const testFile = {
        buffer: Buffer.from("test"),
      };

      jest.spyOn(service as any, "saveImageOnDisk").mockImplementation(() => Promise.reject(new Error("Test error")));

      await expect(service.saveImage(testFile as any)).rejects.toThrow("Не удалось загрузить картинку");
    });
  });

  describe("updateImage", () => {
    it("should update an image and return the updated image entity", async () => {
      const testFile = {
        buffer: Buffer.from("test"),
      } as unknown as Express.Multer.File;

      const testImageEntity = new ImageEntity();
      testImageEntity.id = 1;
      testImageEntity.filename = "test.jpg";
      testImageEntity.data = Buffer.from("old test");

      const updatedImageEntity = new ImageEntity();
      updatedImageEntity.id = 1;
      updatedImageEntity.filename = "test.jpg";
      updatedImageEntity.data = testFile.buffer;

      jest.spyOn(repository, "findOneBy").mockResolvedValue(testImageEntity);
      jest.spyOn(service as any, "saveImageOnDisk").mockImplementation(() => Promise.resolve());
      jest.spyOn(repository, "save").mockResolvedValue(updatedImageEntity);

      const result = await service.updateImage(1, testFile);

      expect(result).toEqual(updatedImageEntity);
      expect((service as any).saveImageOnDisk).toHaveBeenCalledWith(testImageEntity.filename, testFile.buffer);
      expect(repository.save).toHaveBeenCalledWith(updatedImageEntity);
    });
  });

  describe("getImage", () => {
    it("should return the filename if the image file exists", async () => {
      const testImageEntity = new ImageEntity();
      testImageEntity.id = 1;
      testImageEntity.filename = "test.jpg";
      testImageEntity.data = Buffer.from("test");

      jest.spyOn(repository, "findOneBy").mockResolvedValue(testImageEntity);
      jest.spyOn(fs, "access").mockImplementation(() => Promise.resolve());

      const result = await service.getImage(1);

      expect(result).toEqual(testImageEntity.filename);
    });

    it("should return the image data if the image file does not exist", async () => {
      const testImageEntity = new ImageEntity();
      testImageEntity.id = 1;
      testImageEntity.filename = "test.jpg";
      testImageEntity.data = Buffer.from("test");

      jest.spyOn(repository, "findOneBy").mockResolvedValue(testImageEntity);
      jest.spyOn(fs, "access").mockImplementation(() => Promise.reject({ code: "ENOENT" }));

      const result = await service.getImage(1);

      expect(result).toEqual(testImageEntity.data);
    });

    it("should throw an error if accessing the image file fails with an unexpected error", async () => {
      const testImageEntity = new ImageEntity();
      testImageEntity.id = 1;
      testImageEntity.filename = "test.jpg";
      testImageEntity.data = Buffer.from("test");

      jest.spyOn(repository, "findOneBy").mockResolvedValue(testImageEntity);
      jest.spyOn(fs, "access").mockImplementation(() => Promise.reject(new Error("Test error")));

      await expect(service.getImage(1)).rejects.toThrow("Test error");
    });
  });

  describe("deleteImage", () => {
    it("should delete an image", async () => {
      const testImageEntity = new ImageEntity();
      testImageEntity.id = 1;
      testImageEntity.filename = "test.jpg";
      testImageEntity.data = Buffer.from("test");

      jest.spyOn(repository, "findOneBy").mockResolvedValue(testImageEntity);
      jest.spyOn(repository, "remove").mockResolvedValue(testImageEntity);
      jest.spyOn(fs, "unlink").mockImplementation(() => Promise.resolve());

      await service.deleteImage(1);

      expect(repository.remove).toHaveBeenCalledWith(testImageEntity);
      expect(fs.unlink).toHaveBeenCalledWith(service.getPathToImages(testImageEntity.filename));
    });

    it("should throw an error if deleting the image fails", async () => {
      jest.spyOn(repository, "findOneBy").mockResolvedValue(null);

      await expect(service.deleteImage(1)).rejects.toThrow();
    });
  });
});
