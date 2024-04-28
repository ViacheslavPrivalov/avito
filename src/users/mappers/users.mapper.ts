import { User } from "../dto/user.dto";
import { UserEntity } from "../model/user.entity";

export class UsersMapper {
  toUserDto(userEntity: UserEntity): User {
    const dto: User = {
      id: userEntity.id,
      email: userEntity.username,
      firstName: userEntity.firstName,
      lastName: userEntity.lastName,
      phone: userEntity.phone,
      role: userEntity.role,
      image: userEntity.photo,
    };

    return dto;
  }
}
