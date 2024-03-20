import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { Role } from "./Role.enum";
import { CommentEntity } from "src/comments/model/comment.entity";
import { AdEntity } from "src/ads/model/ad.entity";

@Entity({ name: "users" })
export class UserEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  username: string;

  @Column()
  password: string;

  @Column()
  firstName: string;

  @Column()
  lastName: string;

  @Column()
  phone: string;

  @Column()
  role: Role;

  @Column({ nullable: true })
  image: string;

  @OneToMany(() => AdEntity, (ad) => ad.author)
  ads: AdEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author)
  comments: CommentEntity[];
}
