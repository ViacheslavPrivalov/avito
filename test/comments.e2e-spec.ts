import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { CommentsModule } from "../src/comments/comments.module";
import { CaslAbilityFactory } from "../src/auth/services/casl-ability.factory";
import { ValidationPipe } from "../src/validation/pipes/validation.pipe";
import * as bcrypt from "bcrypt";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../src/users/model/User.entity";
import { CommentEntity } from "../src/comments/model/comment.entity";
import { ImageEntity } from "../src/files/model/image.entity";
import { AdEntity } from "../src/ads/model/ad.entity";

describe("CommentsController (e2e)", () => {
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

  const mockAd = {
    title: "Test Ad",
    price: 100,
    description: "This is a test ad",
    photo: "/image/1",
    author: mockUser,
    authorId: 1,
  };

  const mockAdsRepository = {
    findOne: jest.fn().mockImplementation((id) => {
      if (id.where.id === 1) {
        return Promise.resolve(mockAd);
      } else {
        return Promise.resolve(null);
      }
    }),
  };

  const mockComment = {
    text: "Test comment",
    author: mockUser,
    ad: mockAd,
    authorId: 1,
    adId: 1,
  };

  const mockCommentsRepository = {
    findAndCount: jest.fn().mockResolvedValue([[mockComment], 1]),
    findOne: jest.fn().mockImplementation((id) => {
      if (id.where.id === 1) {
        return Promise.resolve(mockComment);
      } else {
        return Promise.resolve(null);
      }
    }),
    create: jest.fn().mockImplementation((ad) => ad),
    save: jest.fn().mockImplementation((ad) => Promise.resolve(ad)),
    remove: jest.fn().mockImplementation((ad) => Promise.resolve(ad)),
  };

  const mockImageRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [CommentsModule],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUsersRepository)
      .overrideProvider(getRepositoryToken(CommentEntity))
      .useValue(mockCommentsRepository)
      .overrideProvider(getRepositoryToken(ImageEntity))
      .useValue(mockImageRepository)
      .overrideProvider(getRepositoryToken(AdEntity))
      .useValue(mockAdsRepository)
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

  describe("/ads/id/comments (GET)", () => {
    it("should get comments", () => {
      return request(app.getHttpServer())
        .get("/ads/1/comments")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });
  });

  describe("/ads/id/comments (POST)", () => {
    it("should add a comment", () => {
      return request(app.getHttpServer())
        .post("/ads/1/comments")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .send({ text: "Test comment" })
        .expect(200);
    });

    it("should return 404 if ad not found", () => {
      return request(app.getHttpServer())
        .post("/ads/2/comments")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .send({ text: "Test comment" })
        .expect(404);
    });
  });

  describe("/ads/adId/comments/commentId (DELETE)", () => {
    it("should delete a comment", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => true,
          }) as any
      );

      return request(app.getHttpServer())
        .delete("/ads/1/comments/1")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });

    it("should return 403 if user is not allowed to delete the comment", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => false,
          }) as any
      );

      return request(app.getHttpServer())
        .delete("/ads/1/comments/1")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(403);
    });

    it("should return 404 if ad or comment not found", () => {
      return request(app.getHttpServer())
        .delete("/ads/2/comments/2")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(404);
    });

    it("should return 401 if not authorized", () => {
      return request(app.getHttpServer()).delete("/ads/1/comments/1").expect(401);
    });
  });

  describe("/ads/adId/comments/commentId (PATCH)", () => {
    it("should update a comment", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => true,
          }) as any
      );

      return request(app.getHttpServer())
        .patch("/ads/1/comments/1")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .send({ text: "Updated comment" })
        .expect(200);
    });

    it("should return 403 if user is not allowed to delete the comment", () => {
      jest.spyOn(caslAbilityFactory, "createForUser").mockImplementation(
        () =>
          ({
            can: () => false,
          }) as any
      );

      return request(app.getHttpServer())
        .delete("/ads/1/comments/1")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(403);
    });

    it("should return 404 if ad or comment not found", () => {
      return request(app.getHttpServer())
        .patch("/ads/2/comments/2")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .send({ text: "Updated comment" })
        .expect(404);
    });

    it("should return 401 if not authorized", () => {
      return request(app.getHttpServer()).delete("/ads/1/comments/1").expect(401);
    });
  });
});
