import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs/promises";
import * as uuid from "uuid";
import { InjectRepository } from "@nestjs/typeorm";
import { ImageEntity } from "../model/image.entity";
import { Repository } from "typeorm";

export const FILE_PATH = path.resolve(__dirname, "../../..", "static");

@Injectable()
export class ImagesService {
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

  async getImage(id: number) {
    const image = await this.imageRepository.findOneBy({ id });

    try {
      await fs.access(this.getPathToImages(image.filename));
      return image.filename;
    } catch (error) {
      if (error.code === "ENOENT") {
        return image.data;
      } else {
        throw error;
      }
    }
  }

  async deleteImage(id: number) {
    const imageEntity = await this.imageRepository.findOneBy({ id });
    await this.imageRepository.remove(imageEntity);

    await fs.unlink(this.getPathToImages(imageEntity.filename));
  }

  getPathToImages(filename: string): string {
    return path.join(FILE_PATH, filename);
  }

  private async saveImageOnDisk(filename: string, buffer: Buffer): Promise<void> {
    try {
      await fs.access(FILE_PATH);
    } catch (error) {
      if (error.code === "ENOENT") {
        await fs.mkdir(FILE_PATH, { recursive: true });
      } else {
        throw error;
      }
    }

    await fs.writeFile(this.getPathToImages(filename), buffer);
  }
}
