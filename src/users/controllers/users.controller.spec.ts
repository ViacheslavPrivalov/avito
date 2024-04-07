import { Test, TestingModule } from "@nestjs/testing";
import { UsersController } from "./users.controller";
import { UsersService } from "../services/users.service";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";

jest.mock("../services/users.service");

const mockUser = { id: 1, username: "User" };
const mockReq = { user: mockUser };

describe("UsersController", () => {
  let controller: UsersController;
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should set password", async () => {
    const stub: NewPassword = { currentPassword: "old", newPassword: "new" };

    await controller.setPassword(stub, mockReq);

    expect(service.setPassword).toHaveBeenCalledWith(stub, mockUser);
  });

  it("should get user", () => {
    (service.getUser as jest.Mock).mockReturnValue(mockUser);

    const result = controller.getUser(mockReq);

    expect(result).toEqual(mockUser);
    expect(service.getUser).toHaveBeenCalledWith(mockUser);
  });

  it("should update user", async () => {
    const updateUser: UpdateUser = { firstName: "test", lastName: "testovich", phone: "123" };

    (service.updateUser as jest.Mock).mockResolvedValue(updateUser);

    const result = await controller.updateUser(updateUser, mockReq);

    expect(result).toEqual(updateUser);
    expect(service.updateUser).toHaveBeenCalledWith(updateUser, mockUser);
  });

  it("should update user image", async () => {
    const mockImage = {} as unknown as Express.Multer.File;

    (service.updateUserImage as jest.Mock).mockResolvedValue(true);

    const result = await controller.updateUserImage(mockImage, mockReq);

    expect(result).toBeTruthy();
    expect(service.updateUserImage).toHaveBeenCalledWith(mockImage, mockUser);
  });
});
