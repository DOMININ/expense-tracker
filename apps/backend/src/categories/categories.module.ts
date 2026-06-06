import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { UserModule } from "../user/user.module";
import { CategoriesController } from "./categories.controller";
import { CreateCategoryHandler } from "./commands/create-category.handler";
import { UpdateCategoryHandler } from "./commands/update-category.handler";
import { DeleteCategoryHandler } from "./commands/delete-category.handler";
import { GetUserCategoriesHandler } from "./queries/get-user-categories.handler";

/**
 * Модуль категорий. Регистрирует {@link CategoriesController} и CQRS-хендлеры
 * CRUD-операций над категориями пользователя. Импортирует `CqrsModule` (шины)
 * и `UserModule` (чтобы {@link CreateCategoryHandler} мог проверять пользователя
 * через `GetUserByIdQuery`). `PrismaService` доступен глобально из `PrismaModule`.
 */
@Module({
  imports: [CqrsModule, UserModule],
  controllers: [CategoriesController],
  providers: [
    CreateCategoryHandler,
    UpdateCategoryHandler,
    DeleteCategoryHandler,
    GetUserCategoriesHandler,
  ],
})
export class CategoriesModule {}
