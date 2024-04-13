import { Module } from "@nestjs/common";
import { ImagesService } from "./services/images.service";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ImageEntity } from "./model/image.entity";
import { ImagesController } from "./controllers/images.controller";

@Module({
  controllers: [ImagesController],
  providers: [ImagesService],
  exports: [ImagesService],
  imports: [TypeOrmModule.forFeature([ImageEntity])],
})
export class FilesModule {}
