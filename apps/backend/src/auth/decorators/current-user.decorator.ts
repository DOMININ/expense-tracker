import { createParamDecorator, ExecutionContext } from "@nestjs/common";

/**
 * Данные текущего пользователя, которые {@link JwtStrategy} кладёт в запрос
 * после валидации токена.
 */
export interface CurrentUserPayload {
  /** ID пользователя (claim `sub` из JWT). */
  userId: string;
  /** Email пользователя из JWT. */
  email: string;
}

/**
 * Параметр-декоратор `@CurrentUser()`: извлекает {@link CurrentUserPayload} из
 * запроса. Работает только на маршрутах под {@link JwtAuthGuard} — иначе
 * `request.user` отсутствует. Читать пользователя следует через этот декоратор,
 * а не из «сырого» запроса.
 *
 * @returns Полезную нагрузку текущего пользователя.
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): CurrentUserPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: CurrentUserPayload }>();
    return request.user;
  },
);
