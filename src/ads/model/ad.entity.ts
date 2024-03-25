import { CommentEntity } from "src/comments/model/comment.entity";
import { UserEntity } from "src/users/model/User.entity";
import { Column, Entity, JoinColumn, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";

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

  @Column({ nullable: true })
  image: string;

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
