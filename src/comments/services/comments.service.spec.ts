import { Repository } from "typeorm";
import { CommentsService } from "./comments.service";
import { CommentEntity } from "../model/comment.entity";
import { CommentsMapper } from "../mappers/comments.mapper";
import { ImagesService } from "../../files/services/images.service";
import { Action, AppAbility, CaslAbilityFactory } from "../../auth/services/casl-ability.factory";
import { TestBed } from "@automock/jest";
import { getRepositoryToken } from "@nestjs/typeorm";
import { UserEntity } from "../../users/model/User.entity";
import { AdEntity } from "../../ads/model/ad.entity";
import { Comments } from "../dto/comments.dto";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { Comment } from "../dto/comment.dto";
import { CommentNotFoundException } from "../../validation/exceptions/comment-not-found.exception";
import { AccessNotAllowedException } from "../../validation/exceptions/access-not-allowed.exception";
import { AdsService } from "../../ads/services/ads.service";

describe("CommentsService", () => {
  let commentsService: CommentsService;
  let repository: jest.Mocked<Repository<CommentEntity>>;
  let mapper: jest.Mocked<CommentsMapper>;
  let casl: jest.Mocked<CaslAbilityFactory>;
  let adsService: jest.Mocked<AdsService>;

  beforeEach(() => {
    const { unit, unitRef } = TestBed.create(CommentsService).compile();

    commentsService = unit;
    repository = unitRef.get(getRepositoryToken(CommentEntity) as string);
    mapper = unitRef.get(CommentsMapper);
    casl = unitRef.get(CaslAbilityFactory);
    adsService = unitRef.get(AdsService);
  });

  describe("getComments", () => {
    it("should return comments by ad id", async () => {
      const commentEntity = new CommentEntity();
      const adEntity = new AdEntity();
      adEntity.id = 1;

      repository.findAndCount.mockResolvedValueOnce([[commentEntity], 1]);
      mapper.toCommentsDto.mockReturnValueOnce(new Comments());

      const result = await commentsService.getComments(1);

      expect(result).toBeInstanceOf(Comments);
      expect(repository.findAndCount).toHaveBeenCalledWith({
        relations: { author: true },
        where: {
          adId: adEntity.id,
        },
      });
      expect(mapper.toCommentsDto).toHaveBeenCalledWith(1, [commentEntity]);
    });
  });

  describe("addComment", () => {
    it("should add an comment", async () => {
      const user = new UserEntity();
      const dto = new CreateOrUpdateComment();
      const adEntity = new AdEntity();
      const commentEntity = new CommentEntity();

      adsService.getAdById.mockResolvedValue(adEntity);
      repository.create.mockReturnValueOnce(commentEntity);
      repository.save.mockResolvedValueOnce(undefined);
      mapper.toCommentDto.mockReturnValueOnce(new Comment());

      const result = await commentsService.addComment(1, dto, user);

      expect(result).toBeInstanceOf(Comment);
      expect(repository.create).toHaveBeenCalledWith({
        text: dto.text,
        createdAt: expect.any(String),
        ad: adEntity,
        author: user,
      });
      expect(repository.save).toHaveBeenCalledWith(commentEntity);
      expect(mapper.toCommentDto).toHaveBeenCalledWith(commentEntity);
    });
  });

  describe("deleteComment", () => {
    it("should delete a comment", async () => {
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const commentEntity = new CommentEntity();
      commentEntity.id = 1;
      commentEntity.authorId = userEntity.id;

      jest.spyOn(commentsService, "getCommentById").mockResolvedValueOnce(commentEntity);
      jest.spyOn(commentsService as any, "isAllowed").mockReturnValueOnce(undefined);
      repository.remove.mockResolvedValueOnce(undefined);

      await commentsService.deleteComment(1, 1, userEntity);

      expect(commentsService.getCommentById).toHaveBeenCalledWith(1, commentEntity.id);
      expect((commentsService as any).isAllowed).toHaveBeenCalledWith(Action.Delete, commentEntity, userEntity);
      expect(repository.remove).toHaveBeenCalledWith(commentEntity);
    });
  });

  describe("updateComment", () => {
    it("should update a comment", async () => {
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const commentEntity = new CommentEntity();
      commentEntity.id = 1;
      commentEntity.authorId = userEntity.id;
      const dto = new CreateOrUpdateComment();

      jest.spyOn(commentsService, "getCommentById").mockResolvedValueOnce(commentEntity);
      jest.spyOn(commentsService as any, "isAllowed").mockReturnValueOnce(undefined);
      repository.save.mockResolvedValueOnce(undefined);
      mapper.toCommentDto.mockReturnValueOnce(new Comment());

      const result = await commentsService.updateComment(1, 1, dto, userEntity);

      expect(result).toBeInstanceOf(Comment);
      expect(commentsService.getCommentById).toHaveBeenCalledWith(1, commentEntity.id);
      expect((commentsService as any).isAllowed).toHaveBeenCalledWith(Action.Update, commentEntity, userEntity);
      expect(repository.save).toHaveBeenCalledWith(commentEntity);
      expect(mapper.toCommentDto).toHaveBeenCalledWith(commentEntity);
    });
  });

  describe("getCommentById", () => {
    it("should return a comment by id", async () => {
      const commentEntity = new CommentEntity();
      commentEntity.id = 1;

      repository.findOne.mockResolvedValueOnce(commentEntity);

      const result = await commentsService.getCommentById(1, commentEntity.id);

      expect(result).toBeInstanceOf(CommentEntity);
      expect(result).toHaveProperty("id", 1);
    });

    it("should throw an exception if comment not found", async () => {
      const adId = 1;
      const commentId = 1;

      repository.findOne.mockResolvedValueOnce(undefined);

      await expect(commentsService.getCommentById(adId, commentId)).rejects.toThrow(CommentNotFoundException);
      expect(repository.findOne).toHaveBeenCalledWith({
        relations: { author: true },
        where: { adId, id: commentId },
      });
    });
  });

  describe("isAllowed", () => {
    it("should allow action", () => {
      const action1 = Action.Update;
      const action2 = Action.Delete;
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const commentEntity = new CommentEntity();
      commentEntity.id = 1;
      commentEntity.authorId = userEntity.id;
      const ability = { can: jest.fn().mockReturnValue(true) } as unknown as AppAbility;

      casl.createForUser.mockReturnValue(ability);

      expect(() => (commentsService as any).isAllowed(action1, commentEntity, userEntity)).not.toThrow();
      expect(() => (commentsService as any).isAllowed(action2, commentEntity, userEntity)).not.toThrow();
    });

    it("should throw an exception if action is not allowed", () => {
      const userEntity = new UserEntity();
      userEntity.id = 1;
      const commentEntity = new CommentEntity();
      commentEntity.id = 1;
      commentEntity.authorId = userEntity.id + 1;
      const ability = { can: jest.fn().mockReturnValue(false) } as unknown as AppAbility;

      casl.createForUser.mockReturnValue(ability);

      expect(() => (commentsService as any).isAllowed(Action.Create, commentEntity, userEntity)).toThrow(
        AccessNotAllowedException
      );
      expect(() => (commentsService as any).isAllowed(Action.Update, commentEntity, userEntity)).toThrow(
        "У вас нет прав доступа или комментарий вам не принадлежит"
      );
      expect(() => (commentsService as any).isAllowed(Action.Delete, commentEntity, userEntity)).toThrow(
        "У вас нет прав доступа или комментарий вам не принадлежит"
      );
    });
  });
});
