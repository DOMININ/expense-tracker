import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { PrismaModule } from "./prisma/prisma.module";
import { UserModule } from "./user/user.module";
import { AuthModule } from "./auth/auth.module";
import { CategoriesModule } from "./categories/categories.module";
import { TransactionsModule } from "./transactions/transactions.module";

/**
 * Корневой модуль приложения. Собирает воедино все фичевые модули
 * (`User`, `Auth`, `Categories`, `Transactions`) и глобальный `PrismaModule`,
 * а также регистрирует `AppController` с маршрутом `/health`.
 */
@Module({
  imports: [
    PrismaModule,
    UserModule,
    AuthModule,
    CategoriesModule,
    TransactionsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
