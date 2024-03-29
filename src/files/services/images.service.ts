import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs/promises";
import * as uuid from "uuid";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "../model/image.entity";
import { Repository } from "typeorm";

@Injectable()
export class ImagesService {
  FILE_PATH = path.resolve(__dirname, "../../..", "static");

  constructor(@InjectRepository(ImageEntity) private imageRepository: Repository<ImageEntity>) {}

  async saveImage(file: Express.Multer.File): Promise<ImageEntity> {
    try {
      const filename = uuid.v4() + ".jpg";

      await this.saveImageOnDisk(filename, file.buffer);

      const newImage = this.imageRepository.create({
        filename,
        data: file.buffer,
      });

      return await this.imageRepository.save(newImage);
    } catch (error) {
      throw new HttpException("Не удалось загрузить картинку", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async updateImage(imageId: number, image: Express.Multer.File): Promise<ImageEntity> {
    const imageToUpdate = await this.imageRepository.findOneBy({ id: imageId });

    await this.saveImageOnDisk(imageToUpdate.filename, image.buffer);

    imageToUpdate.data = image.buffer;

    return await this.imageRepository.save(imageToUpdate);
  }

  async getImage(id: number): Promise<string | Buffer> {
    const image = await this.imageRepository.findOneBy({ id });

    try {
      await fs.access(path.join(this.FILE_PATH, image.filename));
      return image.filename;
    } catch (error) {
      return image.data;
    }
  }

  private async saveImageOnDisk(filename: string, buffer: Buffer): Promise<void> {
    try {
      await fs.access(this.FILE_PATH);
    } catch (error) {
      await fs.mkdir(this.FILE_PATH, { recursive: true });
    }

    await fs.writeFile(path.join(this.FILE_PATH, filename), buffer);
  }
}
