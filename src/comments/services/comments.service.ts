import { Injectable } from "@nestjs/common";
import { CreateOrUpdateComment } from "../dto/create-or-update-comment.dto";

@Injectable()
export class CommentsService {
  getComments(id: number) {
    throw new Error("Method not implemented.");
  }
  addComment(id: number, dto: CreateOrUpdateComment) {
    throw new Error("Method not implemented.");
  }
  deleteComment(adId: number, commentId: number) {
    throw new Error("Method not implemented.");
  }
  updateComment(adId: number, commentId: number, dto: CreateOrUpdateComment) {
    throw new Error("Method not implemented.");
  }
}
