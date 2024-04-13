import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AdEntity } from "../../ads/model/ad.entity";
import { UserEntity } from "../../users/model/User.entity";

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
