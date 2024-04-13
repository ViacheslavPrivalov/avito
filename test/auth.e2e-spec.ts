import { Test, TestingModule } from "@nestjs/testing";
import { INestApplication } from "@nestjs/common";
import * as request from "supertest";
import { UserEntity } from "../src/users/model/User.entity";
import { AuthModule } from "../src/auth/auth.module";
import { getRepositoryToken } from "@nestjs/typeorm";
import { ImageEntity } from "../src/files/model/image.entity";
import * as bcrypt from "bcrypt";
import { ValidationPipe } from "../src/validation/pipes/validation.pipe";

describe("AuthController (e2e)", () => {
  let app: INestApplication;

  const mockUser = {
    username: "test@example.com",
    password: "hashedPassword",
    firstName: "Test",
    lastName: "User",
    phone: "+7 (123) 456-78-90",
    role: "USER",
  };

  const mockUsersRepository = {
    findOneBy: jest.fn().mockImplementation((condition) => {
      if (condition.username === "test@example.com") {
        return Promise.resolve(mockUser);
      } else {
        return Promise.resolve(null);
      }
    }),
    create: jest.fn().mockImplementation((user) => user),
    save: jest.fn().mockImplementation((user) => Promise.resolve(user)),
  };

  const mockImageRepository = {};

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AuthModule],
    })
      .overrideProvider(getRepositoryToken(UserEntity))
      .useValue(mockUsersRepository)
      .overrideProvider(getRepositoryToken(ImageEntity))
      .useValue(mockImageRepository)
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();

    jest.spyOn(bcrypt as any, "hash").mockResolvedValue("hashedPassword");
    jest.spyOn(bcrypt, "compare").mockImplementation((text) => {
      return text === "password123";
    });
  });

  describe("/register (POST)", () => {
    it("should register a user with valid data", () => {
      return request(app.getHttpServer())
        .post("/register")
        .send({
          ...mockUser,
          username: "valid@example.com",
        })
        .expect(201);
    });

    it("should fail validation check", () => {
      return request(app.getHttpServer())
        .post("/register")
        .send({
          username: "abc",
          password: "12",
          firstName: "I",
          lastName: "T",
          phone: "123",
          role: "user",
        })
        .expect(400)
        .then((response) => {
          expect(response.body.message).toStrictEqual([
            "Ошибка в поле: username - Введите корректный email, Ваш email должен быть от 4 до 32 символов",
            "Ошибка в поле: password - Пароль должен быть от 8 до 16 символов",
            "Ошибка в поле: firstName - Имя должно быть от 2 до 16 символов",
            "Ошибка в поле: lastName - Фамилия должна быть от 2 до 16 символов",
            "Ошибка в поле: phone - Введите корректный номер телефона",
            "Ошибка в поле: role - неверно указана роль пользователя",
          ]);
          expect(response.body).toHaveProperty("status", 400);
          expect(response.body).toHaveProperty("error", "Ошибка валидации");
        });
    });

    it("should not register a user with existing email", () => {
      return request(app.getHttpServer())
        .post("/register")
        .send(mockUser)
        .expect(401)
        .then((response) => {
          expect(response.body.message).toBe("Пользователь с таким email уже существует");
          expect(response.body).toHaveProperty("status", 401);
          expect(response.body).toHaveProperty("error", "Ошибка авторизации");
        });
    });
  });

  describe("/login (POST)", () => {
    it("should login a user with valid data", () => {
      return request(app.getHttpServer())
        .post("/login")
        .send({
          username: "test@example.com",
          password: "password123",
        })
        .expect(200);
    });

    it("should fail validation check", () => {
      return request(app.getHttpServer())
        .post("/login")
        .send({
          username: "abc",
          password: "12",
        })
        .expect(400)
        .then((response) => {
          expect(response.body.message).toStrictEqual([
            "Ошибка в поле: username - Введите корректный email, Ваш email должен быть от 4 до 32 символов",
            "Ошибка в поле: password - Пароль должен быть от 8 до 16 символов",
          ]);
          expect(response.body).toHaveProperty("status", 400);
          expect(response.body).toHaveProperty("error", "Ошибка валидации");
        });
    });

    it("should not login a user with non-existing email", () => {
      return request(app.getHttpServer())
        .post("/login")
        .send({
          username: "nonexisting@example.com",
          password: "password123",
        })
        .expect(401)
        .then((response) => {
          expect(response.body.message).toBe("Неверный email");
          expect(response.body).toHaveProperty("status", 401);
          expect(response.body).toHaveProperty("error", "Ошибка авторизации");
        });
    });

    it("should not login a user with invalid password", () => {
      return request(app.getHttpServer())
        .post("/login")
        .send({
          username: "test@example.com",
          password: "wrongpassword",
        })
        .expect(401)
        .then((response) => {
          expect(response.body.message).toBe("Неверный пароль");
          expect(response.body).toHaveProperty("status", 401);
          expect(response.body).toHaveProperty("error", "Ошибка авторизации");
        });
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
