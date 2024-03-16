import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { UserEntity } from "src/users/model/User.entity";
import { Repository } from "typeorm";
import { Register } from "../dto/register.dto";
import * as bcrypt from "bcrypt";
import { Login } from "../dto/login.dto";
import { UsersService } from "src/users/services/users.service";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>,
    private usersService: UsersService
  ) {}

  async register(dto: Register) {
    const candidate = await this.usersService.getUserByUsername(dto.username);

    if (candidate) {
      throw new HttpException(
        "Пользователь с таким email уже существует",
        HttpStatus.BAD_REQUEST
      );
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);
    const user = this.usersRepository.create({
      ...dto,
      password: hashPassword,
    });

    await this.usersRepository.save(user);
  }

  async login(dto: Login) {
    const user = await this.usersService.getUserByUsername(dto.username);

    if (!user) {
      throw new HttpException(
        "Пользователь с таким email не был найден",
        HttpStatus.NOT_FOUND
      );
    }
    const usersPassword = await bcrypt.compare(dto.password, user.password);

    if (!usersPassword)
      throw new HttpException("Неверный пароль", HttpStatus.BAD_REQUEST);
  }
}
