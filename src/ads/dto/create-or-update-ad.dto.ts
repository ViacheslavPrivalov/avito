import { ApiProperty } from "@nestjs/swagger";
import { Transform } from "class-transformer";
import { IsInt, IsString, Length, Max, Min } from "class-validator";

export class CreateOrUpdateAd {
  @ApiProperty({ description: "заголовок объявления" })
  @IsString()
  @Length(4, 32, { message: "Заголовок объявления должен быть от 4 до 32 символов" })
  readonly title: string;

  @ApiProperty({ description: "цена объявления" })
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(0, { message: "Цена должна быть больше 0" })
  @Max(10000000, { message: "Цена должна быть меньше 10_000_000" })
  readonly price: number;

  @ApiProperty({ description: "описание объявления" })
  @IsString()
  @Length(8, 64, { message: "Описание объявления должно быть от 8 до 64 символов" })
  readonly description: string;
}
