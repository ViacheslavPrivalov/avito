import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

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
}
