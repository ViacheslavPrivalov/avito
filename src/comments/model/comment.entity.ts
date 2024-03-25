import { AdEntity } from "src/ads/model/ad.entity";
import { UserEntity } from "src/users/model/User.entity";
import { Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "comments" })
export class CommentEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  text: string;

  @Column()
  createdAt: Date;

  @Column()
  authorId: number;

  @Column()
  adId: number;

  @ManyToOne(() => UserEntity, (user) => user.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  author: UserEntity;

  @ManyToOne(() => AdEntity, (ad) => ad.comments, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  ad: AdEntity;
}
