import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
} from "@nestjs/common";
import { CommentsService } from "../services/comments.service";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";

@Controller("ads")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(":id/comments")
  getComments(@Param("id") id: number) {
    return this.commentsService.getComments(id);
  }

  @Post(":id/comments")
  addComment(@Param("id") id: number, @Body() dto: CreateOrUpdateComment) {
    return this.commentsService.addComment(id, dto);
  }

  @Delete(":adId/comments/:commentId")
  deleteComment(
    @Param("adId") adId: number,
    @Param("commentId") commentId: number
  ) {
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
