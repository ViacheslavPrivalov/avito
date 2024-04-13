import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { UsersModule } from "../src/users/users.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../src/users/model/User.entity";
import * as bcrypt from "bcrypt";
import { ValidationPipe } from "../src/validation/pipes/validation.pipe";
import { ImagesService } from "../src/files/services/images.service";
import { ImageEntity } from "../src/files/model/image.entity";

describe("UsersController (e2e)", () => {
  let app: INestApplication;

  const mockUser = {
    username: "test@example.com",
    password: "hashedPassword",
    firstName: "Test",
    lastName: "User",
    phone: "+7 (123) 456-78-90",
    role: "USER",
  };

  const mockUserWithPhoto = {
    username: "test@photo.com",
    password: "hashedPassword",
    firstName: "Test",
    lastName: "User",
    phone: "+7 (123) 456-78-90",
    role: "USER",
    photo: "/image/1",
  };

  const mockUsersRepository = {
    findOne: jest.fn().mockImplementation((condition) => {
      if (condition.where.username === "test@example.com") {
        return Promise.resolve(mockUser);
      } else if (condition.where.username === "test@photo.com") {
        return Promise.resolve(mockUserWithPhoto);
      } else {
        return Promise.resolve(null);
      }
    }),
    create: jest.fn().mockImplementation((user) => user),
    save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
  };

  const mockImagesService = {
    updateImage: jest.fn().mockResolvedValue(undefined),
    saveImage: jest.fn().mockResolvedValue({ id: 1 }),
  };
  const mockImageRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [UsersModule],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUsersRepository)
      .overrideProvider(getRepositoryToken(ImageEntity))
      .useValue(mockImageRepository)
      .overrideProvider(ImagesService)
      .useValue(mockImagesService)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jest.spyOn(bcrypt as any, "hash").mockResolvedValue("hashedPassword");
    jest.spyOn(bcrypt, "compare").mockImplementation((text) => {
      return text === "password123";
    });
  });

  describe("/users/set_password (POST)", () => {
    it("should set a password for a user with valid data", () => {
      return request(app.getHttpServer())
        .post("/users/set_password")
        .send({ currentPassword: "password123", newPassword: "newPassword" })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });

    it("should not set a password for a user with invalid current password", () => {
      return request(app.getHttpServer())
        .post("/users/set_password")
        .send({ currentPassword: "wrongPassword", newPassword: "newPassword" })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(403)
        .then((response) => {
          expect(response.body.message).toBe("Неверный пароль");
          expect(response.body).toHaveProperty("status", 403);
          expect(response.body).toHaveProperty("error", "Ошибка доступа");
        });
    });
  });

  describe("/users/me (GET)", () => {
    it("should get a user with valid token", () => {
      return request(app.getHttpServer())
        .get("/users/me")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });

    it("should not get a user with invalid token", () => {
      return request(app.getHttpServer())
        .get("/users/me")
        .expect(401)
        .then((response) => {
          expect(response.body.message).toBe("Пользователь не авторизован");
          expect(response.body).toHaveProperty("status", 401);
          expect(response.body).toHaveProperty("error", "Ошибка авторизации");
        });
    });

    it("should not get a user with invalid login", () => {
      return request(app.getHttpServer())
        .get("/users/me")
        .set("Authorization", "Basic " + Buffer.from(`user@test.com:password123`).toString("base64"))
        .expect(401)
        .then((response) => {
          expect(response.body.message).toBe("Пользователь с таким email не был найден");
          expect(response.body).toHaveProperty("status", 401);
          expect(response.body).toHaveProperty("error", "Ошибка авторизации");
        });
    });

    it("should not get a user with invalid password", () => {
      return request(app.getHttpServer())
        .get("/users/me")
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:wrongPassword`).toString("base64"))
        .expect(401)
        .then((response) => {
          expect(response.body.message).toBe("Неверный пароль");
          expect(response.body).toHaveProperty("status", 401);
          expect(response.body).toHaveProperty("error", "Ошибка авторизации");
        });
    });
  });

  describe("/users/me (PATCH)", () => {
    it("should update a user with valid data", () => {
      return request(app.getHttpServer())
        .patch("/users/me")
        .send({ firstName: "User", lastName: "Test", phone: "+7 (123) 456-78-90" })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });

    it("should not update a user with invalid data", () => {
      return request(app.getHttpServer())
        .patch("/users/me")
        .send({ firstName: "ab", lastName: "ab", phone: "123" })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(400)
        .then((response) => {
          expect(response.body.message).toStrictEqual([
            "Ошибка в поле: firstName - Имя должно быть от 3 до 10 символов",
            "Ошибка в поле: lastName - Фамилия должна быть от 3 до 10 символов",
            "Ошибка в поле: phone - Введите корректный номер телефона",
          ]);
          expect(response.body).toHaveProperty("status", 400);
          expect(response.body).toHaveProperty("error", "Ошибка валидации");
        });
    });
  });

  describe("/users/me/image (PATCH)", () => {
    it("should update image for user with image", () => {
      return request(app.getHttpServer())
        .patch("/users/me/image")
        .send({ filename: "newImage.jpg" })
        .set("Authorization", "Basic " + Buffer.from(`${mockUserWithPhoto.username}:password123`).toString("base64"))
        .expect(200);
    });

    it("should save image for user without image", () => {
      return request(app.getHttpServer())
        .patch("/users/me/image")
        .send({ filename: "newImage.jpg" })
        .set("Authorization", "Basic " + Buffer.from(`${mockUser.username}:password123`).toString("base64"))
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
