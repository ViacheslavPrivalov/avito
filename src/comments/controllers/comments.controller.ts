import { Body, Controller, Delete, Get, HttpCode, Param, Patch, Post, Request, UseGuards } from "@nestjs/common";
import { CommentsService } from "../services/comments.service";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";
import { Comment } from "../dto/comment.dto";
import { Comments } from "../dto/comments.dto";
import { ApiBasicAuth, ApiBody, ApiOperation, ApiParam, ApiResponse, ApiTags } from "@nestjs/swagger";
import { AuthGuard } from "../../auth/guards/auth.guard";
import { UserEntity } from "../../users/model/User.entity";
import { User } from "../../auth/decorators/user.decorator";
import { ParseIdPipe } from "../../validation/pipes/parse-id.pipe";

@ApiTags("Комментарии")
@ApiBasicAuth()
@UseGuards(AuthGuard)
@Controller("ads")
export class CommentsController {
  constructor(private commentsService: CommentsService) {}

  @Get(":id/comments")
  @ApiOperation({ summary: "Получение комментариев объявления" })
  @ApiParam({ name: "id", required: true })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not found" })
  getComments(@Param("id", ParseIdPipe) id: number): Promise<Comments> {
    return this.commentsService.getComments(id);
  }

  @Post(":id/comments")
  @HttpCode(200)
  @ApiOperation({ summary: "Добавление комментария к объявлению" })
  @ApiParam({ name: "id", required: true })
  @ApiBody({ type: CreateOrUpdateComment })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 404, description: "Not found" })
  addComment(
    @Param("id", ParseIdPipe) id: number,
    @Body() dto: CreateOrUpdateComment,
    @User() user: UserEntity
  ): Promise<Comment> {
    return this.commentsService.addComment(id, dto, user);
  }

  @Delete(":adId/comments/:commentId")
  @ApiOperation({ summary: "Удаление комментария" })
  @ApiParam({ name: "adId", required: true })
  @ApiParam({ name: "commentId", required: true })
  @ApiResponse({ status: 200, description: "OK" })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  deleteComment(
    @Param("adId", ParseIdPipe) adId: number,
    @Param("commentId", ParseIdPipe) commentId: number,
    @User() user: UserEntity
  ): Promise<void> {
    return this.commentsService.deleteComment(adId, commentId, user);
  }

  @Patch(":adId/comments/:commentId")
  @ApiOperation({ summary: "Обновление комментария" })
  @ApiParam({ name: "adId", required: true })
  @ApiParam({ name: "commentId", required: true })
  @ApiBody({ type: CreateOrUpdateComment })
  @ApiResponse({ status: 200, description: "OK", type: Comment })
  @ApiResponse({ status: 401, description: "Unauthorized" })
  @ApiResponse({ status: 403, description: "Forbidden" })
  @ApiResponse({ status: 404, description: "Not found" })
  updateComment(
    @Param("adId", ParseIdPipe) adId: number,
    @Param("commentId", ParseIdPipe) commentId: number,
    @Body() dto: CreateOrUpdateComment,
    @User() user: UserEntity
  ): Promise<Comment> {
    return this.commentsService.updateComment(adId, commentId, dto, user);
  }
}
