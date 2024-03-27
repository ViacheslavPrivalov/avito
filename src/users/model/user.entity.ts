import { Column, Entity, JoinColumn, OneToMany, OneToOne, PrimaryGeneratedColumn } from "typeorm";
import { CommentEntity } from "src/comments/model/comment.entity";
import { AdEntity } from "src/ads/model/ad.entity";

export enum Role {
  USER = "user",
  ADMIN = "admin",
}

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

  @Column({ type: "enum", enum: Role, default: Role.USER })
  role: Role;

  @Column({ nullable: true })
  photo: string;

  @OneToMany(() => AdEntity, (ad) => ad.author, {
    cascade: ["update", "remove"],
  })
  ads: AdEntity[];

  @OneToMany(() => CommentEntity, (comment) => comment.author, {
    cascade: ["update", "remove"],
  })
  comments: CommentEntity[];
}
