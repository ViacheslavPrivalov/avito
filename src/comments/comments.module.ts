import { Module } from "@nestjs/common";
import { CommentsController } from "./controllers/comments.controller";
import { CommentsService } from "./services/comments.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentEntity } from "./model/comment.entity";
import { CommentsMapper } from "./mappers/comments.mapper";
import { AdsModule } from "../ads/ads.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsMapper],
  imports: [TypeOrmModule.forFeature([CommentEntity]), UsersModule, AdsModule, AuthModule],
})
export class CommentsModule {}
