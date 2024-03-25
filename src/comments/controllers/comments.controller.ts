import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { CommentsService } from "../services/comments.service";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Comment } from "../dto/comment.dto";
import { UserEntity } from "src/users/model/User.entity";
import { User } from "src/auth/decorators/user.decorator";

@UseGuards(AuthGuard)
@Controller("ads")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(":id/comments")
  getComments(@Param("id") id: number) {
    return this.commentsService.getComments(id);
  }

  @Post(":id/comments")
  addComment(@Param("id") id: number, @Body() dto: CreateOrUpdateComment, @User() user: UserEntity): Promise<Comment> {
    return this.commentsService.addComment(id, dto, user);
  }

  @Delete(":adId/comments/:commentId")
  deleteComment(@Param("adId") adId: number, @Param("commentId") commentId: number, @User() user: UserEntity) {
    return this.commentsService.deleteComment(adId, commentId, user);
  }

  @Patch(":adId/comments/:commentId")
  updateComment(
    @Param("adId") adId: number,
    @Param("commentId") commentId: number,
    @Body() dto: CreateOrUpdateComment,
    @User() user: UserEntity
  ) {
    return this.commentsService.updateComment(adId, commentId, dto, user);
  }
}
