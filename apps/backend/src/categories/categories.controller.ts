import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../auth/decorators/current-user.decorator";
import {
  CreateCategoryDto,
  UpdateCategoryDto,
} from "@expence-tracker/shared";
import { CreateCategoryCommand } from "./commands/create-category.command";
import { UpdateCategoryCommand } from "./commands/update-category.command";
import { DeleteCategoryCommand } from "./commands/delete-category.command";
import { GetUserCategoriesQuery } from "./queries/get-user-categories.query";

@Controller("categories")
@UseGuards(JwtAuthGuard)
export class CategoriesController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(
    @Body() dto: CreateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new CreateCategoryCommand(user.userId, dto.name, dto.color, dto.icon),
    );
  }

  @Get()
  findAll(@CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(new GetUserCategoriesQuery(user.userId));
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateCategoryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new UpdateCategoryCommand(user.userId, id, dto),
    );
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.commandBus.execute(
      new DeleteCategoryCommand(user.userId, id),
    );
  }
}
