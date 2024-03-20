import { ForbiddenException, Injectable, UnauthorizedException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../model/User.entity";
import { Repository } from "typeorm";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";
import { User } from "../dto/user.dto";
import { UsersMapper } from "../mappers/users.mapper";
import * as bcrypt from "bcrypt";
import { ImagesService } from "src/files/services/images.service";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private usersMapper: UsersMapper,
    private imagesService: ImagesService
  ) {}

  async setPassword(newPassword: NewPassword, user: UserEntity) {
    try {
      const isValidPassword = await bcrypt.compare(newPassword.currentPassword, user.password);

      if (!isValidPassword) throw new Error("Неверный пароль");

      const newHashPassword = await bcrypt.hash(newPassword.newPassword, 5);
      user.password = newHashPassword;

      await this.usersRepository.save(user);
    } catch (error) {
      throw new ForbiddenException(error.message);
    }
  }

  getUser(user: UserEntity): User {
    return this.usersMapper.toUserDto(user);
  }

  async updateUser(updateUser: UpdateUser, user: UserEntity): Promise<UpdateUser> {
    for (const prop in updateUser) {
      user[prop] = updateUser[prop];
    }

    await this.usersRepository.save(user);

    return updateUser;
  }
  async updateUserImage(image: Express.Multer.File, user: UserEntity) {
    const filename = this.imagesService.createFilename(image);
    user.image = "/" + filename;
    await this.usersRepository.save(user);
  }

  async getUserByUsername(username: string): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { username },
    });

    return user;
  }
}
