import { ApiProperty } from "@nestjs/swagger";

export class Comment {
  @ApiProperty({ description: "id автора комментария" })
  readonly author: number;

  @ApiProperty({ description: "ссылка на аватар автора комментария" })
  readonly authorImage: string;

  @ApiProperty({ description: "имя создателя комментария" })
  readonly authorFirstName: string;

  @ApiProperty({ description: "дата и время создания комментария в миллисекундах с 00:00:00 01.01.1970" })
  readonly createdAt: Date;

  @ApiProperty({ description: "id комментария" })
  readonly pk: number;

  @ApiProperty({ description: "текст комментария" })
  readonly text: string;
}
