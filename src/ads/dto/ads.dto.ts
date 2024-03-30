import { ApiProperty } from "@nestjs/swagger";
import { Ad } from "./ad.dto";

export class Ads {
  @ApiProperty({ description: "общее количество объявлений" })
  readonly count: number;

  @ApiProperty({ description: "массив объявлений", type: [Ad] })
  readonly results: Ad[];
}
