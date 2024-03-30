import { ApiProperty } from "@nestjs/swagger";
import { Comment } from "./comment.dto";

export class Comments {
  @ApiProperty({ description: "общее количество комментариев" })
  readonly count: number;

  @ApiProperty({ description: "массив комментариев", type: [Comment] })
  readonly results: Comment[];
}
