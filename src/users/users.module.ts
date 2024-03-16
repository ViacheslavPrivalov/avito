import { Module } from "@nestjs/common";
import { UsersController } from "./controllers/users.controller";
import { UsersService } from "./services/users.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./model/User.entity";
import { UsersMapper } from "./mappers/users.mapper";

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersMapper],
  imports: [TypeOrmModule.forFeature([UserEntity])],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
