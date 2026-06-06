import "dotenv/config";
import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.enableCors({
    origin: process.env["FRONTEND_URL"] ?? "http://localhost:3000",
    credentials: true,
  });
  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, transform: true, forbidNonWhitelisted: true }),
  );

  // Swagger UI доступен на /docs. `addBearerAuth` включает кнопку Authorize
  // для JWT — токен подставляется в заголовок Authorization у защищённых маршрутов.
  const swaggerConfig = new DocumentBuilder()
    .setTitle("Expence Tracker API")
    .setDescription("HTTP API для учёта доходов и расходов")
    .setVersion("1.0")
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env["PORT"] ?? 3001);
}
bootstrap();
