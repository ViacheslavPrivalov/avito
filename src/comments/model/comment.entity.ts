import { AdEntity } from "src/ads/model/ad.entity";
import { UserEntity } from "src/users/model/User.entity";
import { Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "comments" })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => UserEntity, (user) => user.comments)
  author: UserEntity;

  @ManyToOne(() => AdEntity, (ad) => ad.comments)
  ad: AdEntity;
}
