import { HttpAdapterHost, NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { AllExceptionsFilter } from "./validation/filters/all-exceptions.filter";
import { ValidationPipe } from "./validation/pipes/validation.pipe";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const PORT = process.env.PORT || 3000;

  const httpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapterHost));

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, () => console.log(`App is running on port ${PORT}`));
}

bootstrap();
