import { Module } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import { JwtModule } from "@nestjs/jwt";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { AuthController } from "./auth.controller";
import { RegisterHandler } from "./commands/register.handler";
import { LoginHandler } from "./queries/login.handler";
import { JwtStrategy } from "./guards/jwt.strategy";

/**
 * Модуль аутентификации: регистрация, вход и `GET /auth/me`. Настраивает
 * `JwtModule` (секрет из `JWT_SECRET`, срок жизни токена 7 дней) и Passport,
 * регистрирует {@link JwtStrategy}. Импортирует `UserModule`, чтобы хендлеры
 * могли создавать и искать пользователей через шины.
 */
@Module({
  imports: [
    CqrsModule,
    UserModule,
    PassportModule,
    JwtModule.register({
      secret: process.env["JWT_SECRET"] ?? "change_me_in_production",
      signOptions: { expiresIn: "7d" },
    }),
  ],
  controllers: [AuthController],
  providers: [RegisterHandler, LoginHandler, JwtStrategy],
})
export class AuthModule {}
