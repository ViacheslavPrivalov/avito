import { ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { UserEntity } from "src/users/model/User.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "../model/comment.entity";
import { Repository } from "typeorm";
import { CommentsMapper } from "../mappers/comments.mapper";
import { Comment } from "../dto/comment.dto";
import { AdsService } from "src/ads/services/ads.service";
import { Action, CaslAbilityFactory } from "src/auth/services/casl-ability.factory";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity) private commentsRepository: Repository<CommentEntity>,
    private adsService: AdsService,
    private caslAbilityFactory: CaslAbilityFactory,
    private commentsMapper: CommentsMapper
  ) {}

  async getComments(id: number) {
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

  async deleteComment(adId: number, commentId: number, user: UserEntity) {
    const comment = await this.getCommentById(adId, commentId);

    if (!this.isAllowed(Action.Delete, comment, user))
      throw new ForbiddenException("У вас нет прав доступа или комментарий вам не принадлежит");

    await this.commentsRepository.remove(comment);
  }

  async updateComment(adId: number, commentId: number, dto: CreateOrUpdateComment, user: UserEntity) {
    const comment = await this.getCommentById(adId, commentId);

    if (!this.isAllowed(Action.Update, comment, user))
      throw new ForbiddenException("У вас нет прав доступа или комментарий вам не принадлежит");

    comment.text = dto.text;

    await this.commentsRepository.save(comment);

    return this.commentsMapper.toCommentDto(comment);
  }

  public async getCommentById(adId: number, commentId: number): Promise<CommentEntity> {
    const commentEntity = await this.commentsRepository.findOne({
      relations: { author: true },
      where: { adId, id: commentId },
    });

    if (!commentEntity) throw new NotFoundException("Комментарий не был найден");

    return commentEntity;
  }

  private isAllowed(action: Action, commentEntity: CommentEntity, user: UserEntity): boolean {
    const ability = this.caslAbilityFactory.createForUser(user);

    return ability.can(action, commentEntity);
  }
}
