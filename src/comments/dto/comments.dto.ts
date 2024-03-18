import { Comment } from "./comment.dto";

export class Comments {
  readonly count: number;
  readonly results: Comment[];
}
