import { HttpException, HttpStatus, Injectable } from "@nestjs/common";
import * as path from "path";
import * as fs from "fs";
import * as uuid from "uuid";

@Injectable()
export class ImagesService {
  createFilename(file: Express.Multer.File) {
    try {
      const filename = uuid.v4() + ".jpg";
      const filepath = path.resolve(__dirname, "../../..", "static");

      if (!fs.existsSync(filepath)) {
        fs.mkdirSync(filepath);
      }

      fs.writeFileSync(path.join(filepath, filename), file.buffer);
      return filename;
    } catch (error) {
      throw new HttpException("Не удалось загрузить картинку", HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
