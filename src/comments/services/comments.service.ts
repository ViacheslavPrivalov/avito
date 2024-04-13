import { Injectable } from "@nestjs/common";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "../model/comment.entity";
import { Repository } from "typeorm";
import { CommentsMapper } from "../mappers/comments.mapper";
import { Comment } from "../dto/comment.dto";
import { Comments } from "../dto/comments.dto";
import { UserEntity } from "../../users/model/User.entity";
import { AdsService } from "../../ads/services/ads.service";
import { Action, CaslAbilityFactory } from "../../auth/services/casl-ability.factory";
import { AccessNotAllowedException } from "../../validation/exceptions/access-not-allowed.exception";
import { CommentNotFoundException } from "../../validation/exceptions/comment-not-found.exception";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity) private commentsRepository: Repository<CommentEntity>,
    private adsService: AdsService,
    private caslAbilityFactory: CaslAbilityFactory,
    private commentsMapper: CommentsMapper
  ) {}

  async getComments(id: number): Promise<Comments> {
    const [entities, count] = await this.commentsRepository.findAndCount({
      relations: { author: true },
      where: {
        adId: id,
      },
    });

    return this.commentsMapper.toCommentsDto(count, entities);
  }

  async addComment(id: number, dto: CreateOrUpdateComment, user: UserEntity): Promise<Comment> {
    const adEntity = await this.adsService.getAdById(id);

    const newComment = this.commentsRepository.create({
      text: dto.text,
      createdAt: new Date().toISOString(),
      ad: adEntity,
      author: user,
    });

    await this.commentsRepository.save(newComment);

    return this.commentsMapper.toCommentDto(newComment);
  }

  async deleteComment(adId: number, commentId: number, user: UserEntity): Promise<void> {
    const comment = await this.getCommentById(adId, commentId);

    this.isAllowed(Action.Delete, comment, user);

    await this.commentsRepository.remove(comment);
  }

  async updateComment(adId: number, commentId: number, dto: CreateOrUpdateComment, user: UserEntity): Promise<Comment> {
    const comment = await this.getCommentById(adId, commentId);

    this.isAllowed(Action.Update, comment, user);

    comment.text = dto.text;

    await this.commentsRepository.save(comment);

    return this.commentsMapper.toCommentDto(comment);
  }

  public async getCommentById(adId: number, commentId: number): Promise<CommentEntity> {
    const commentEntity = await this.commentsRepository.findOne({
      relations: { author: true },
      where: { adId, id: commentId },
    });

    if (!commentEntity) throw new CommentNotFoundException();

    return commentEntity;
  }

  private isAllowed(action: Action, commentEntity: CommentEntity, user: UserEntity): void {
    const ability = this.caslAbilityFactory.createForUser(user);

    if (!ability.can(action, commentEntity))
      throw new AccessNotAllowedException("У вас нет прав доступа или комментарий вам не принадлежит");
  }
}
