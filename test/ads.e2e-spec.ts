import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { AdsModule } from "../src/ads/ads.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { AdEntity } from "../src/ads/model/ad.entity";
import { UserEntity } from "../src/users/model/User.entity";
import { ImageEntity } from "../src/files/model/image.entity";
import { ValidationPipe } from "../src/validation/pipes/validation.pipe";
import * as bcrypt from "bcrypt";
import { ImagesService } from "../src/files/services/images.service";
import { CaslAbilityFactory } from "../src/auth/services/casl-ability.factory";

describe("AdsController (e2e)", () => {
  let app: INestApplication;
  let caslAbilityFactory: CaslAbilityFactory;

  const mockUser = {
    username: "test@example.com",
    password: "hashedPassword",
    firstName: "Test",
    lastName: "User",
    phone: "+7 (123) 456-78-90",
    role: "USER",
  };

  const mockUsersRepository = {
    findOne: jest.fn().mockImplementation((condition) => {
      if (condition.where.username === "test@example.com") {
        return Promise.resolve(mockUser);
      } else {
        return Promise.resolve(null);
      }
    }),
    create: jest.fn().mockImplementation((user) => user),
    save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
  };

  const mockImage = Buffer.alloc(10);

  const mockImagesService = {
    updateImage: jest.fn().mockImplementation((imageId, image) => {
      return Promise.resolve({
        id: imageId,
        filename: "mockFilename",
        data: image.buffer,
      });
    }),
    saveImage: jest.fn().mockResolvedValue({ id: 1, ...mockImage }),
    deleteImage: jest.fn().mockResolvedValue(undefined),
  };

  const mockImageRepository = {};

  const mockAd = {
    title: "Test Ad",
    price: 100,
    description: "This is a test ad",
    photo: "/image/1",
    author: mockUser,
    authorId: 1,
  };

  const mockAdsRepository = {
    findAndCount: jest.fn().mockResolvedValue([[mockAd], 1]),
    findOne: jest.fn().mockImplementation((id) => {
      if (id.where.id === 1) {
        return Promise.resolve(mockAd);
      } else {
        return Promise.resolve(null);
      }
    }),
    create: jest.fn().mockImplementation((ad) => ad),
    save: jest.fn().mockImplementation((ad) => Promise.resolve(ad)),
    remove: jest.fn().mockImplementation((ad) => Promise.resolve(ad)),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AdsModule],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUsersRepository)
      .overrideProvider(getRepositoryToken(AdEntity))
      .useValue(mockAdsRepository)
      .overrideProvider(getRepositoryToken(ImageEntity))
      .useValue(mockImageRepository)
      .overrideProvider(ImagesService)
      .useValue(mockImagesService)
      .compile();

    app = moduleFixture.createNestApplication();
    caslAbilityFactory = app.get<CaslAbilityFactory>(CaslAbilityFactory);
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jest.spyOn(bcrypt as any, "hash").mockResolvedValue("hashedPassword");
    jest.spyOn(bcrypt, "compare").mockImplementation((text) => {
      return text === "password123";
    });
  });

  describe("/ads (GET)", () => {
    it("should return all ads", () => {
      return request(app.getHttpServer())
        .get("/ads")
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty("count", 1);
          expect(response.body.results).toStrictEqual([{ image: "/image/1", price: 100, title: "Test Ad" }]);
        });
    });
  });

  describe("/ads (POST)", () => {
    it("should add an ad", () => {
      const mockImage = Buffer.alloc(10);

      return request(app.getHttpServer())
        .post("/ads")
        .attach("properties", Buffer.from(JSON.stringify(mockAd)), "properties.json")
        .attach("image", mockImage, "newImage.jpg")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(201)
        .then((response) => {
          expect(response.body).toHaveProperty("title", "Test Ad");
          expect(response.body).toHaveProperty("price", 100);
          expect(response.body).toHaveProperty("image", "/image/1");
        });
    });
  });

  describe("/ads/me (GET)", () => {
    it("should return ads of authorized user", () => {
      return request(app.getHttpServer())
        .get("/ads/me")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200)
        .then((response) => {
          expect(response.body).toHaveProperty("count", 1);
          expect(response.body.results).toStrictEqual([{ image: "/image/1", price: 100, title: "Test Ad" }]);
        });
    });
  });

  describe("/ads/id (GET)", () => {
    it("should return ad by id", () => {
      return request(app.getHttpServer())
        .get("/ads/1")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200)
        .then((response) => {
          expect(response.body).toStrictEqual({
            authorFirstName: "Test",
            authorLastName: "User",
            description: "This is a test ad",
            email: "test@example.com",
            image: "/image/1",
            phone: "+7 (123) 456-78-90",
            price: 100,
            title: "Test Ad",
          });
        });
    });

    it("should return 404 if ad not found", () => {
      return request(app.getHttpServer())
        .get("/ads/2")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(404);
    });
  });

  describe("/ads/id (DELETE)", () => {
    it("should delete an ad", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => true,
          }) as any
      );
      return request(app.getHttpServer())
        .delete("/ads/1")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(204);
    });

    it("should return 403 if user is not allowed to delete the ad", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => false,
          }) as any
      );

      return request(app.getHttpServer())
        .delete("/ads/1")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(403);
    });

    it("should return 404 if ad not found", () => {
      return request(app.getHttpServer())
        .delete("/ads/2")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(404);
    });

    it("should return 401 if not authorized", () => {
      return request(app.getHttpServer()).delete("/ads/1").expect(401);
    });
  });

  describe("/ads/id (PATCH)", () => {
    it("should update an ad", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => true,
          }) as any
      );
      return request(app.getHttpServer())
        .patch("/ads/1")
        .send({
          title: "New Title",
          price: 123,
          description: "New Test Description",
        })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });

    it("should return 403 if user is not allowed to update the ad", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => false,
          }) as any
      );

      return request(app.getHttpServer())
        .patch("/ads/1")
        .send({
          title: "New Title",
          price: 123,
          description: "New Test Description",
        })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(403)
        .then((response) => {
          expect(response.body.message).toBe("У вас нет прав доступа или объявление вам не принадлежит");
        });
    });

    it("should return 404 if ad not found", () => {
      return request(app.getHttpServer())
        .patch("/ads/2")
        .send({
          title: "New Title",
          price: 123,
          description: "New Test Description",
        })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(404);
    });

    it("should return 401 if not authorized", () => {
      return request(app.getHttpServer())
        .patch("/ads/1")
        .send({
          title: "New Title",
          price: 123,
          description: "New Test Description",
        })
        .expect(401);
    });
  });

  describe("/ads/id/image (PATCH)", () => {
    it("should update an ad image", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => true,
          }) as any
      );

      return request(app.getHttpServer())
        .patch("/ads/1/image")
        .attach("image", mockImage, "newImage.jpg")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });

    it("should return 404 if ad not found", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => true,
          }) as any
      );

      return request(app.getHttpServer())
        .patch("/ads/2/image")
        .attach("image", mockImage, "newImage.jpg")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(404);
    });

    it("should return 401 if not authorized", () => {
      return request(app.getHttpServer()).patch("/ads/1/image").attach("image", mockImage, "newImage.jpg").expect(401);
    });

    it("should return 403 if user is not allowed to update image", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => false,
          }) as any
      );

      return request(app.getHttpServer())
        .patch("/ads/1/image")
        .attach("image", mockImage, "newImage.jpg")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(403)
        .then((response) => {
          expect(response.body.message).toBe("У вас нет прав доступа или объявление вам не принадлежит");
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
