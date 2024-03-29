import { Controller, Get, Param } from "@nestjs/common";
import { ImagesService } from "../services/images.service";
import { ParseIdPipe } from "src/validation/pipes/parse-id.pipe";

@Controller("image")
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Get(":id")
  getImage(@Param("id", ParseIdPipe) id: number): Promise<string | Buffer> {
    return this.imagesService.getImage(id);
  }
}
