import { Test, TestingModule } from "@nestjs/testing";
import { CommentsController } from "./comments.controller";
import { CommentsService } from "../services/comments.service";
import { UserEntity } from "../../users/model/user.entity";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { Comments } from "../dto/comments.dto";
import { Comment } from "../dto/comment.dto";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";

jest.mock("../services/comments.service");

const mockUser = new UserEntity();
const mockComments = new Comments();
const mockComment = new Comment();
const mockGuard = {};

describe("CommentsController", () => {
  let controller: CommentsController;
  let service: CommentsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CommentsController],
      providers: [CommentsService],
    })
      .overrideGuard(AuthGuard)
      .useValue(mockGuard)
      .compile();

    controller = module.get<CommentsController>(CommentsController);
    service = module.get<CommentsService>(CommentsService);
  });

  it("should be defined", () => {
    expect(controller).toBeDefined();
    expect(service).toBeDefined();
  });

  it("should return comments", async () => {
    (service.getComments as jest.Mock).mockResolvedValue(mockComments);

    const result = await controller.getComments(1);

    expect(result).toBe(mockComments);
    expect(service.getComments).toHaveBeenCalledWith(1);
  });

  it("should add a comment", async () => {
    const stub = new CreateOrUpdateComment();

    (service.addComment as jest.Mock).mockResolvedValue(mockComment);

    const result = await controller.addComment(1, stub, mockUser);

    expect(result).toBe(mockComment);
    expect(service.addComment).toHaveBeenCalledWith(1, stub, mockUser);
  });

  it("should delete a comment", async () => {
    (service.deleteComment as jest.Mock).mockImplementation(() => Promise.resolve());

    await controller.deleteComment(1, 1, mockUser);
    expect(service.deleteComment).toHaveBeenCalledWith(1, 1, mockUser);
  });

  it("should update a comment", async () => {
    const stub = new CreateOrUpdateComment();

    (service.updateComment as jest.Mock).mockResolvedValue(mockComment);

    const result = await controller.updateComment(1, 1, stub, mockUser);

    expect(result).toBe(mockComment);
    expect(service.updateComment).toHaveBeenCalledWith(1, 1, stub, mockUser);
  });
});
