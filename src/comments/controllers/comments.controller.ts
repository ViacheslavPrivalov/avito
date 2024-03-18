import { Body, Controller, Delete, Get, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { CommentsService } from "../services/comments.service";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { AuthGuard } from "src/auth/guards/auth.guard";
import { Comment } from "../dto/comment.dto";

@UseGuards(AuthGuard)
@Controller("ads")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(":id/comments")
  getComments(@Param("id") id: number, @Request() req) {
    return this.commentsService.getComments(id, req.user);
  }

  @Post(":id/comments")
  addComment(@Param("id") id: number, @Body() dto: CreateOrUpdateComment, @Request() req): Promise<Comment> {
    return this.commentsService.addComment(id, dto, req.user);
  }

  @Delete(":adId/comments/:commentId")
  deleteComment(@Param("adId") adId: number, @Param("commentId") commentId: number) {
    return this.commentsService.deleteComment(adId, commentId);
  }

  @Patch(":adId/comments/:commentId")
  updateComment(
    @Param("adId") adId: number,
    @Param("commentId") commentId: number,
    @Body() dto: CreateOrUpdateComment
  ) {
    return this.commentsService.updateComment(adId, commentId, dto);
  }
}
