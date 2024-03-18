import { Injectable, NotFoundException } from "@nestjs/common";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { UserEntity } from "src/users/model/User.entity";
import { InjectRepository } from "@nestjs/typeorm";
import { CommentEntity } from "../model/comment.entity";
import { Repository } from "typeorm";
import { AdEntity } from "src/ads/model/ad.entity";
import { CommentsMapper } from "../mappers/comments.mapper";
import { Comment } from "../dto/comment.dto";
import { AdsMapper } from "src/ads/mappers/ads.mapper";

@Injectable()
export class CommentsService {
  constructor(
    @InjectRepository(CommentEntity) private commentsRepository: Repository<CommentEntity>,
    @InjectRepository(AdEntity) private adsRepository: Repository<AdEntity>,
    private commentsMapper: CommentsMapper
  ) {}

  async getComments(id: number, user: UserEntity) {
    const adEntity = await this.adsRepository.findOneBy({ id });

    if (!adEntity) throw new NotFoundException("Объявление не найдено");

    const [entities, count] = await this.commentsRepository.findAndCount({
      relations: { author: true },
      where: {
        adId: adEntity.id,
      },
    });

    return this.commentsMapper.toCommentsDto(count, entities);
  }

  async addComment(id: number, dto: CreateOrUpdateComment, user: UserEntity): Promise<Comment> {
    const adEntity = await this.adsRepository.findOneBy({ id });

    if (!adEntity) throw new NotFoundException("Объявление не найдено");

    const newComment = this.commentsRepository.create({
      text: dto.text,
      createdAt: new Date().toISOString(),
      ad: adEntity,
      author: user,
    });

    await this.commentsRepository.save(newComment);

    return this.commentsMapper.toCommentDto(newComment);
  }

  async deleteComment(adId: number, commentId: number) {
    const comment = await this.commentsRepository.findOne({ where: { id: commentId, adId } });

    if (!comment) throw new NotFoundException("Комментарий не был найден");

    await this.commentsRepository.remove(comment);
  }

  async updateComment(adId: number, commentId: number, dto: CreateOrUpdateComment) {
    const comment = await this.commentsRepository.findOne({
      relations: { author: true },
      where: {
        id: commentId,
        adId,
      },
    });

    if (!comment) throw new NotFoundException("Комментарий не был найден");

    comment.text = dto.text;

    await this.commentsRepository.save(comment);

    return this.commentsMapper.toCommentDto(comment);
  }
}
