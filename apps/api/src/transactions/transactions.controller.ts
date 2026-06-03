import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { CommandBus, QueryBus } from "@nestjs/cqrs";
import { JwtAuthGuard } from "../auth/guards/jwt.guard";
import {
  CurrentUser,
  CurrentUserPayload,
} from "../auth/decorators/current-user.decorator";
import {
  CreateTransactionDto,
  ListTransactionsQueryDto,
  UpdateTransactionDto,
} from "@expence-tracker/shared";
import { CreateTransactionCommand } from "./commands/create-transaction.command";
import { UpdateTransactionCommand } from "./commands/update-transaction.command";
import { DeleteTransactionCommand } from "./commands/delete-transaction.command";
import { GetUserTransactionsQuery } from "./queries/get-user-transactions.query";
import { GetTransactionByIdQuery } from "./queries/get-transaction-by-id.query";

@Controller("transactions")
@UseGuards(JwtAuthGuard)
export class TransactionsController {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  @Post()
  create(
    @Body() dto: CreateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new CreateTransactionCommand(
        user.userId,
        dto.amount,
        dto.type,
        dto.description,
        dto.date,
        dto.categoryId,
      ),
    );
  }

  @Get()
  findAll(
    @Query() query: ListTransactionsQueryDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.queryBus.execute(
      new GetUserTransactionsQuery(
        user.userId,
        query.month,
        query.year,
        query.page,
        query.limit,
      ),
    );
  }

  @Get(":id")
  findOne(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.queryBus.execute(
      new GetTransactionByIdQuery(user.userId, id),
    );
  }

  @Patch(":id")
  update(
    @Param("id") id: string,
    @Body() dto: UpdateTransactionDto,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.commandBus.execute(
      new UpdateTransactionCommand(user.userId, id, dto),
    );
  }

  @Delete(":id")
  @HttpCode(204)
  remove(@Param("id") id: string, @CurrentUser() user: CurrentUserPayload) {
    return this.commandBus.execute(
      new DeleteTransactionCommand(user.userId, id),
    );
  }
}
