import { Comment } from "../dto/comment.dto";
import { CommentEntity } from "../model/comment.entity";
import { Comments } from "../dto/comments.dto";

export class CommentsMapper {
  toCommentDto(commentEntity: CommentEntity): Comment {
    const dto: Comment = {
      author: commentEntity.author.id,
      authorImage: "",
      authorFirstName: commentEntity.author.firstName,
      createdAt: commentEntity.createdAt,
      pk: commentEntity.id,
      text: commentEntity.text,
    };

    return dto;
  }

  toCommentsDto(count: number, entities: CommentEntity[]): Comments {
    const comments: Comment[] = entities.map((entity) => this.toCommentDto(entity));

    const dto: Comments = {
      count,
      results: [...comments],
    };

    return dto;
  }
}
