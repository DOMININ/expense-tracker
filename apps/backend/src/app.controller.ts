import { Controller, Get } from "@nestjs/common";
import { AppService } from "./app.service";

/**
 * Корневой контроллер приложения. Содержит только liveness-проверку `/health`.
 */
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  /**
   * `GET /health` — проверка доступности сервиса (без авторизации).
   *
   * @returns Объект `{ status: "ok" }`.
   */
  @Get("health")
  health(): { status: string } {
    return this.appService.health();
  }
}
