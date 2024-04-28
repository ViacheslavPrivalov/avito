import { Test, TestingModule } from "@nestjs/testing";
import { AuthService } from "./auth.service";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../../users/model/user.entity";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";
import { Register } from "../dto/register.dto";
import { Login } from "../dto/login.dto";

describe("AuthService", () => {
  let service: AuthService;
  let repository: Repository<UserEntity>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useClass: Repository,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    repository = module.get<Repository<UserEntity>>(getRepositoryToken(UserEntity));
  });

  it("should be defined", () => {
    expect(service).toBeDefined();
    expect(repository).toBeDefined();
  });

  describe("register", () => {
    it("should register a user", async () => {
      const dto = {
        username: "test",
        password: "test",
      } as unknown as Register;
      const hashedPassword = "hash";

      const testUserEntity = new UserEntity();
      testUserEntity.username = dto.username;
      testUserEntity.password = hashedPassword;

      jest.spyOn(repository, "findOneBy").mockResolvedValue(undefined);
      jest.spyOn(bcrypt as any, "hash").mockResolvedValue(testUserEntity.password);
      jest.spyOn(repository, "create").mockReturnValue(testUserEntity);
      jest.spyOn(repository, "save").mockResolvedValue(undefined);

      await service.register(dto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ username: dto.username });
      expect(bcrypt.hash).toHaveBeenCalledWith(dto.password, 5);
      expect(repository.create).toHaveBeenCalledWith({
        ...dto,
        password: testUserEntity.password,
      });
      expect(repository.save).toHaveBeenCalledWith(testUserEntity);
    });

    it("should throw an error if the user already exists", async () => {
      const dto = {
        username: "test",
        password: "test",
      } as unknown as Register;

      jest.spyOn(repository, "findOneBy").mockResolvedValue(new UserEntity());

      await expect(service.register(dto)).rejects.toThrow("Пользователь с таким email уже существует");
    });
  });

  describe("login", () => {
    it("should login a user", async () => {
      const dto: Login = {
        username: "test",
        password: "test",
      };
      const hashedPassword = "hash";

      const testUserEntity = new UserEntity();
      testUserEntity.username = dto.username;
      testUserEntity.password = hashedPassword;

      jest.spyOn(repository, "findOneBy").mockResolvedValue(testUserEntity);
      jest.spyOn(bcrypt as any, "compare").mockResolvedValue(true);

      await service.login(dto);

      expect(repository.findOneBy).toHaveBeenCalledWith({ username: dto.username });
      expect(bcrypt.compare).toHaveBeenCalledWith(dto.password, testUserEntity.password);
    });

    it("should throw an error if the username is incorrect", async () => {
      const dto: Login = {
        username: "test",
        password: "test",
      };

      jest.spyOn(repository, "findOneBy").mockResolvedValue(undefined);

      await expect(service.login(dto)).rejects.toThrow("Неверный email");
    });

    it("should throw an error if the password is incorrect", async () => {
      const dto: Login = {
        username: "test",
        password: "test",
      };

      const testUserEntity = new UserEntity();

      jest.spyOn(repository, "findOneBy").mockResolvedValue(testUserEntity);
      jest.spyOn(bcrypt as any, "compare").mockResolvedValue(false);

      await expect(service.login(dto)).rejects.toThrow("Неверный пароль");
    });
  });
});
