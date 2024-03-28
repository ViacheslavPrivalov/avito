import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { CommentsService } from "../services/comments.service";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Comment } from "../dto/comment.dto";
import { UserEntity } from "src/users/model/User.entity";
import { User } from "src/auth/decorators/user.decorator";
import { ParseIdPipe } from "src/validation/pipes/parse-id.pipe";

@UseGuards(AuthGuard)
@Controller("ads")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(":id/comments")
  getComments(@Param("id", ParseIdPipe) id: number) {
    return this.commentsService.getComments(id);
  }

  @Post(":id/comments")
  addComment(
    @Param("id", ParseIdPipe) id: number,
    @Body() dto: CreateOrUpdateComment,
    @User() user: UserEntity
  ): Promise<Comment> {
    return this.commentsService.addComment(id, dto, user);
  }

  @Delete(":adId/comments/:commentId")
  deleteComment(
    @Param("adId", ParseIdPipe) adId: number,
    @Param("commentId", ParseIdPipe) commentId: number,
    @User() user: UserEntity
  ) {
    return this.commentsService.deleteComment(adId, commentId, user);
  }

  @Patch(":adId/comments/:commentId")
  updateComment(
    @Param("adId", ParseIdPipe) adId: number,
    @Param("commentId", ParseIdPipe) commentId: number,
    @Body() dto: CreateOrUpdateComment,
    @User() user: UserEntity
  ) {
    return this.commentsService.updateComment(adId, commentId, dto, user);
  }
}
