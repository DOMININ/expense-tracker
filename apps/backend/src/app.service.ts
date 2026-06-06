import { Injectable } from "@nestjs/common";

/**
 * Сервис корневого модуля. Обслуживает liveness-проверку.
 */
@Injectable()
export class AppService {
  /**
   * Возвращает статус сервиса для health-check.
   *
   * @returns Объект `{ status: "ok" }`.
   */
  health(): { status: string } {
    return { status: "ok" };
  }
}
