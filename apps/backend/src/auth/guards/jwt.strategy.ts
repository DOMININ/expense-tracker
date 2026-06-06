import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";

/**
 * Passport-стратегия JWT. Извлекает Bearer-токен из заголовка `Authorization`,
 * проверяет подпись секретом `JWT_SECRET` и срок действия. Используется
 * {@link JwtAuthGuard}.
 */
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env["JWT_SECRET"] ?? "change_me_in_production",
    });
  }

  /**
   * Преобразует проверенный payload токена в объект пользователя, который
   * Passport кладёт в `request.user` (доступен через `@CurrentUser()`).
   *
   * @param payload Раскодированный JWT: `sub` (id пользователя) и `email`.
   * @returns Полезную нагрузку пользователя `{ userId, email }`.
   */
  async validate(payload: { sub: string; email: string }) {
    return { userId: payload.sub, email: payload.email };
  }
}
