import { Injectable } from "@nestjs/common";
import { AuthGuard } from "@nestjs/passport";

/**
 * Гард JWT-аутентификации. Тонкая обёртка над Passport `AuthGuard("jwt")`:
 * запускает {@link JwtStrategy}, и при отсутствии/невалидности токена
 * отклоняет запрос с `401 Unauthorized`. Навешивается через `@UseGuards()`.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard("jwt") {}
