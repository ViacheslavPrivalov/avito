import { UserEntity } from "src/users/model/User.entity";
import { Column, Entity, OneToOne, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "images" })
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true, nullable: true })
  filename: string;

  @Column({ type: "bytea", nullable: true })
  data: Buffer;
}
