import { Controller, Get, Param, ParseIntPipe } from "@nestjs/common";
import { ImagesService } from "../services/images.service";

@Controller("image")
export class ImagesController {
  constructor(private imagesService: ImagesService) {}

  @Get(":id")
  getImage(@Param("id", ParseIntPipe) id: number) {
    return this.imagesService.getImage(id);
  }
}
