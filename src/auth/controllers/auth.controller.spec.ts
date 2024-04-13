import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "../services/auth.service";
import { Register } from "../dto/register.dto";
import { Login } from "../dto/login.dto";

jest.mock("../services/auth.service");

const mockRegister = new Register();
const mockLogin = new Login();

describe("AuthController", () => {
  let controller: AuthController;
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    service = module.get<AuthService>(AuthService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
  });

  it("should register a user", async () => {
    (service.register as jest.Mock).mockImplementation(() => Promise.resolve());

    await controller.register(mockRegister);

    expect(service.register).toHaveBeenCalledWith(mockRegister);
  });

  it("should login a user", async () => {
    (service.login as jest.Mock).mockImplementation(() => Promise.resolve());

    await controller.login(mockLogin);

    expect(service.login).toHaveBeenCalledWith(mockLogin);
  });
});
