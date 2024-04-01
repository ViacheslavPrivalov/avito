import { Controller, Get, Param, Res } from "@nestjs/common";
import { ImagesService } from "../services/images.service";
import { ParseIdPipe } from "src/validation/pipes/parse-id.pipe";
import { ApiExcludeController } from "@nestjs/swagger";
import { Response } from "express";

@ApiExcludeController()
@Controller("image")
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Get(":id")
  async getImage(@Param("id", ParseIdPipe) id: number, @Res() res: Response) {
    const data = await this.imagesService.getImage(id);

    if (data instanceof Buffer) {
      res.writeHead(200, {
        "Content-Length": Buffer.byteLength(data),
        "Content-Type": "image/jpeg",
      });

      res.end(data);
    } else {
      res.sendFile(this.imagesService.getPathToImages(data));
    }
  }
}
