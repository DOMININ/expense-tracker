import { CommandHandler, ICommandHandler, CommandBus } from "@nestjs/cqrs";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import { RegisterCommand } from "./register.command";
import { CreateUserCommand } from "../../user/commands/create-user.command";

@CommandHandler(RegisterCommand)
export class RegisterHandler implements ICommandHandler<RegisterCommand> {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly jwtService: JwtService,
  ) {}

  async execute(command: RegisterCommand) {
    const passwordHash = await bcrypt.hash(command.password, 10);
    const user = await this.commandBus.execute(
      new CreateUserCommand(command.name, command.email, passwordHash),
    );
    const accessToken = this.jwtService.sign({ sub: user.id, email: user.email });
    return { accessToken };
  }
}
