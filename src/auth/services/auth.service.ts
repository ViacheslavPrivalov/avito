import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Register } from "../dto/register.dto";
import * as bcrypt from "bcrypt";
import { Login } from "../dto/login.dto";
import { UserEntity } from "../../users/model/user.entity";
import { AuthorizationException } from "../../validation/exceptions/authorization.exception";

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private usersRepository: Repository<UserEntity>
  ) {}

  async register(dto: Register): Promise<void> {
    const candidate = await this.usersRepository.findOneBy({ username: dto.username });

    if (candidate) {
      throw new AuthorizationException("Пользователь с таким email уже существует");
    }

    const hashPassword = await bcrypt.hash(dto.password, 5);
    const user = this.usersRepository.create({
      ...dto,
      password: hashPassword,
    });

    await this.usersRepository.save(user);
  }

  async login(dto: Login): Promise<void> {
    const user = await this.usersRepository.findOneBy({ username: dto.username });

    if (!user) throw new AuthorizationException("Неверный email");

    const usersPassword = await bcrypt.compare(dto.password, user.password);

    if (!usersPassword) throw new AuthorizationException("Неверный пароль");
  }
}
