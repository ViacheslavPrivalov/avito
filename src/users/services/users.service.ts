import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../model/User.entity";
import { Repository } from "typeorm";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";
import { User } from "../dto/user.dto";
import { UsersMapper } from "../mappers/users.mapper";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private usersMapper: UsersMapper
  ) {}

  setPassword(newPassword: NewPassword) {
    return null;
  }

  getUser(user: UserEntity): User {
    return this.usersMapper.toUserDto(user);
  }

  updateUser(updateUser: UpdateUser) {
    return null;
  }
  updateUserImage(image: any) {
    throw new Error("Method not implemented.");
  }

  async getUserByUsername(username: string): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { username },
    });

    return user;
  }
}
