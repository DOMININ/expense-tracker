import { Injectable, OnModuleInit } from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

/**
 * Единый слой доступа к данным: расширяет `PrismaClient` и играет роль
 * репозитория для CQRS-хендлеров. Инжектится только в хендлеры — контроллеры
 * работают с данными через шины команд/запросов.
 */
@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  /**
   * Хук жизненного цикла Nest: открывает соединение с БД при инициализации модуля.
   *
   * @returns Промис, разрешающийся после установки соединения.
   */
  async onModuleInit() {
    await this.$connect();
  }
}
