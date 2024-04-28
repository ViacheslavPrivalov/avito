import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { CommentEntity } from "../../comments/model/comment.entity";
import { UserEntity } from "../../users/model/user.entity";

@Entity({ name: "ads" })
export class AdEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  @Column()
  price: number;

  @Column()
  description: string;

  @Column()
  photo: string;

  @Column()
  authorId: number;

  @ManyToOne(() => UserEntity, (user) => user.ads, {
    onDelete: "CASCADE",
    onUpdate: "CASCADE",
  })
  @JoinColumn()
  author: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.ad, {
    cascade: ["update", "remove"],
  })
  comments: CommentEntity[];
}
