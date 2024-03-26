import { AbilityBuilder, ExtractSubjectType, InferSubjects, MongoAbility, createMongoAbility } from "@casl/ability";
import { Injectable } from "@nestjs/common";
import { AdEntity } from "src/ads/model/ad.entity";
import { CommentEntity } from "src/comments/model/comment.entity";
import { UserEntity } from "src/users/model/User.entity";

export enum Action {
  Manage = "manage",
  Create = "create",
  Read = "read",
  Update = "update",
  Delete = "delete",
}

export type Subjects = InferSubjects<typeof AdEntity | typeof CommentEntity> | "all";

export type AppAbility = MongoAbility<[Action, Subjects]>;

@Injectable()
export class CaslAbilityFactory {
  createForUser(user: UserEntity) {
    const { can, cannot, build } = new AbilityBuilder<AppAbility>(createMongoAbility);

    if (user.role === "admin") {
      can(Action.Manage, "all");
    } else {
      can(Action.Read, "all");
      can(Action.Create, [AdEntity, CommentEntity]);
      can(Action.Update, [AdEntity, CommentEntity], { authorId: user.id });
      can(Action.Delete, [AdEntity, CommentEntity], { authorId: user.id });
    }

    return build({
      detectSubjectType: (item) => item.constructor as ExtractSubjectType<Subjects>,
    });
  }
}