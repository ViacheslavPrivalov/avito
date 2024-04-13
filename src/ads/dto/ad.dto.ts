import { ApiProperty } from "@nestjs/swagger";

export class Ad {
  @ApiProperty({ description: "id автора объявления" })
  readonly author: number;

  @ApiProperty({ description: "ссылка на картинку объявления" })
  readonly image: string;

  @ApiProperty({ description: "id объявления" })
  readonly pk: number;

  @ApiProperty({ description: "цена объявления" })
  readonly price: number;

  @ApiProperty({ description: "заголовок объявления" })
  readonly title: string;
}
