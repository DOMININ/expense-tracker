import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { CreateUserHandler } from "./commands/create-user.handler";
import { GetUserByEmailHandler } from "./queries/get-user-by-email.handler";
import { GetUserByIdHandler } from "./queries/get-user-by-id.handler";

@Module({
  imports: [CqrsModule],
  providers: [CreateUserHandler, GetUserByEmailHandler, GetUserByIdHandler],
  exports: [CqrsModule],
})
export class UserModule {}
