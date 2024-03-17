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

  image: string;

  @ManyToOne(() => UserEntity, (user) => user.ads)
  @JoinColumn()
  author: UserEntity;

  @OneToMany(() => CommentEntity, (comment) => comment.ad)
  comments: CommentEntity[];
}
