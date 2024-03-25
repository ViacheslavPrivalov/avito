import { Module } from "@nestjs/common";
import { CommentsController } from "./controllers/comments.controller";
import { CommentsService } from "./services/comments.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommentEntity } from "./model/comment.entity";
import { AdEntity } from "src/ads/model/ad.entity";
import { CommentsMapper } from "./mappers/comments.mapper";
import { UsersModule } from "src/users/users.module";
import { AdsModule } from "src/ads/ads.module";
import { AuthModule } from "src/auth/auth.module";

@Module({
  controllers: [CommentsController],
  providers: [CommentsService, CommentsMapper],
  imports: [TypeOrmModule.forFeature([CommentEntity]), UsersModule, AdsModule, AuthModule],
})
export class CommentsModule {}
