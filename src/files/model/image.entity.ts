import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity({ name: "images" })
export class ImageEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  filename: string;

  @Column({ type: "bytea" })
  data: Buffer;
}
