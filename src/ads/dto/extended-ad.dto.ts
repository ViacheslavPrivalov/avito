import { ApiProperty } from "@nestjs/swagger";

export class ExtendedAd {
  @ApiProperty({ description: "id объявления" })
  readonly pk: number;

  @ApiProperty({ description: "имя автора объявления" })
  readonly authorFirstName: string;

  @ApiProperty({ description: "фамилия автора объявления" })
  readonly authorLastName: string;

  @ApiProperty({ description: "описание объявления" })
  readonly description: string;

  @ApiProperty({ description: "логин автора объявления" })
  readonly email: string;

  @ApiProperty({ description: "ссылка на картинку объявления" })
  readonly image: string;

  @ApiProperty({ description: "телефон автора объявления" })
  readonly phone: string;

  @ApiProperty({ description: "цена объявления" })
  readonly price: number;

  @ApiProperty({ description: "заголовок объявления" })
  readonly title: string;
}
