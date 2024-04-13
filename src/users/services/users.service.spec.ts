import { TestBed } from "@automock/jest";
import { UsersService } from "./users.service";
import { Repository } from "typeorm";
import { Role, UserEntity } from "../model/User.entity";
import { getRepositoryToken } from "@nestjs/typeorm";
import * as bcrypt from "bcrypt";
import { UsersMapper } from "../mappers/users.mapper";
import { UpdateUser } from "../dto/update-user.dto";
import { ImagesService } from "../../files/services/images.service";
import { ImageEntity } from "../../files/model/image.entity";

jest.mock("bcrypt");

describe("UsersService", () => {
  let usersService: UsersService;
  let repository: jest.Mocked<Repository<UserEntity>>;
  let mapper: jest.Mocked<UsersMapper>;
  let imagesService: jest.Mocked<ImagesService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(UsersService).compile();

    usersService = unit;
    repository = unitRef.get(getRepositoryToken(UserEntity) as string);
    mapper = unitRef.get(UsersMapper);
    imagesService = unitRef.get(ImagesService);
  });

  describe("setPassword", () => {
    it("should update the password if the current password is correct", async () => {
      const user = new UserEntity();
      user.password = "oldPassword";
      const hashedPassword = "hashedPassword";
      const newPassword = { currentPassword: "oldPassword", newPassword: "newPassword" };

      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (bcrypt.hash as jest.Mock).mockResolvedValue(hashedPassword);

      await usersService.setPassword(newPassword, user);

      expect(user.password).toBe(hashedPassword);
      expect(repository.save).toHaveBeenCalledWith(user);
    });

    it("should throw an error if the current password is incorrect", async () => {
      const user = new UserEntity();
      user.password = "oldPassword";
      const newPassword = { currentPassword: "wrongPassword", newPassword: "newPassword" };

      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(usersService.setPassword(newPassword, user)).rejects.toThrow("Неверный пароль");
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe("getUser", () => {
    it("should return a User DTO", () => {
      const user: UserEntity = {
        id: 1,
        username: "test@example.com",
        firstName: "Test",
        lastName: "User",
        phone: "1234567890",
        role: Role.USER,
        photo: "/image/1",
        password: "",
        ads: [],
        comments: [],
      };

      const expectedDto = mapper.toUserDto(user);
      const returnedDto = usersService.getUser(user);

      expect(returnedDto).toEqual(expectedDto);
      expect(mapper.toUserDto).toHaveBeenCalledWith(user);
    });
  });

  describe("updateUser", () => {
    it("should update the user with the provided fields", async () => {
      const user = new UserEntity();
      user.username = "testUser";
      const updateUser = { username: "newUsername" } as unknown as UpdateUser;

      await usersService.updateUser(updateUser, user);

      expect(user.username).toBe("newUsername");
      expect(repository.save).toHaveBeenCalledWith(user);
    });
  });

  describe("updateUserImage", () => {
    it("should update the user image if one exists", async () => {
      const user = new UserEntity();
      user.photo = "/image/1";
      const image = { filename: "newImage.jpg" } as unknown as Express.Multer.File;

      imagesService.updateImage.mockResolvedValue(undefined);

      await usersService.updateUserImage(image, user);

      expect(user.photo).toBe("/image/1");
      expect(imagesService.updateImage).toHaveBeenCalledWith(1, image);
    });

    it("should create a new user image if one does not exist", async () => {
      const user = new UserEntity();
      const image = { filename: "newImage.jpg" } as unknown as Express.Multer.File;

      imagesService.saveImage.mockResolvedValue({ id: 1 } as unknown as ImageEntity);

      await usersService.updateUserImage(image, user);

      expect(user.photo).toBeDefined();
      expect(user.photo).toBe("/image/1");
      expect(imagesService.saveImage).toHaveBeenCalledWith(image);
      expect(repository.save).toHaveBeenCalledWith(user);
    });
  });

  describe("getUserByUsername", () => {
    it("should return a UserEntity if the user exists", async () => {
      const username = "test";
      const user = new UserEntity();
      user.username = username;

      repository.findOne.mockResolvedValue(user);

      const foundUser = await usersService.getUserByUsername(username);

      expect(foundUser).toBeDefined();
      expect(foundUser.username).toBe(username);
    });

    it("should throw an error if the user does not exist", async () => {
      const username = "";

      await expect(usersService.getUserByUsername(username)).rejects.toThrow(
        "Пользователь с таким email не был найден"
      );
    });
  });
});
