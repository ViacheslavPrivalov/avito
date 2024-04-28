import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "../model/user.entity";
import { Repository } from "typeorm";
import { NewPassword } from "../dto/new-password.dto";
import { UpdateUser } from "../dto/update-user.dto";
import { User } from "../dto/user.dto";
import { UsersMapper } from "../mappers/users.mapper";
import * as bcrypt from "bcrypt";
import { ImagesService } from "../../files/services/images.service";
import { AccessNotAllowedException } from "../../validation/exceptions/access-not-allowed.exception";
import { UserNotFoundException } from "../../validation/exceptions/user-not-found.exception";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private usersMapper: UsersMapper,
    private imagesService: ImagesService
  ) {}

  async setPassword(newPassword: NewPassword, user: UserEntity): Promise<void> {
    try {
      const isValidPassword = await bcrypt.compare(newPassword.currentPassword, user.password);

      if (!isValidPassword) throw new Error("Неверный пароль");

      const newHashPassword = await bcrypt.hash(newPassword.newPassword, 5);
      user.password = newHashPassword;

      await this.usersRepository.save(user);
    } catch (error) {
      throw new AccessNotAllowedException(error.message);
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

  async updateUserImage(image: Express.Multer.File, user: UserEntity): Promise<void> {
    if (user.photo) {
      const imageIdToUpdate = Number(user.photo.slice(-1));
      await this.imagesService.updateImage(imageIdToUpdate, image);
    } else {
      const userPhoto = await this.imagesService.saveImage(image);
      user.photo = `/image/${userPhoto.id}`;
      await this.usersRepository.save(user);
    }
  }

  async getUserByUsername(username: string): Promise<UserEntity> {
    const user: UserEntity = await this.usersRepository.findOne({
      where: { username },
    });

    if (!user) throw new UserNotFoundException();

    return user;
  }
}
