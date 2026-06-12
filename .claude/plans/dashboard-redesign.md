# Redesign frontend → fintech dashboard (по референсу)

## Context

Текущий фронтенд (`apps/frontend`, Next.js 15 + FSD + shadcn/ui + Tailwind 3) использует
дефолтную shadcn `slate`-тему, верхний `AppHeader` с nav и простые карточки-списки.
Пользователь хочет применить стиль референса — современный fintech-дашборд: тёмный
иконочный сайдбар, тёплый off-white фон, один голубой акцент, крупные жирные суммы,
карточки баланса, quick-actions, таблица операций и правая панель статистики с
donut-графиком.

**Решения пользователя:** полный реструктур в дашборд; шрифты — Bricolage Grotesque
(заголовки/суммы) + Hanken Grotesk (текст), всё через `next/font/google` без новых npm-зависимостей.

**Принципы:** вся логика/хуки/API остаются нетронутыми — меняем только презентацию и
композицию. FSD-правила (импорт только вниз, доступ к слайсам через `index.ts`) и shadcn-примитивы
сохраняются. Charting — без библиотек: donut на чистом CSS/SVG (`conic-gradient`).
Иконки — `lucide-react` (уже в зависимостях). Текст UI — русский.

---

## 1. Design system foundation

**`src/app/layout.tsx`** — подключить `Bricolage_Grotesque` (var `--font-display`) и
`Hanken_Grotesk` (var `--font-sans`) через `next/font/google`, повесить классы на `<body>`.

**`src/app/globals.css`** — переписать `:root` токены под тёплую светлую тему:
- `--background` тёплый off-white (~`40 20% 97%`), `--foreground` графит (~`0 0% 12%`)
- `--card` белый; `--primary` графит (~`0 0% 14%`) + светлый foreground (тёмные кнопки/карта)
- `--muted`/`--secondary`/`--accent` — тёплые светло-серые; `--border` мягкий
- **новые токены:** `--brand` / `--brand-foreground` (небесно-голубой ~`210 80% 75%`, тёмный текст),
  `--sidebar` / `--sidebar-foreground` (графит ~`0 0% 13%`),
  статусы `--success`, `--warning`, `--danger` (+ `-foreground`) пастельные
- `--radius: 1rem`
- декоративный фон: лёгкий радиальный/точечный паттерн как утилита (опц. класс), без картинок

**`tailwind.config.ts`** — расширить:
- `fontFamily`: `sans` → `var(--font-sans)`, `display` → `var(--font-display)`
- `colors`: добавить `brand`, `sidebar`, `success`, `warning`, `danger` (по образцу существующих)
- `borderRadius`: добавить `xl`/`2xl` от `--radius`
- `boxShadow`: мягкие токены (`soft`, `card`)
- `keyframes` + `animation`: `fade-up` (для staggered page-load), оставить accordion

## 2. Shared UI primitives

- **`button.tsx`** — скругление `rounded-xl`; новый вариант `brand` (`bg-brand text-brand-foreground`);
  сохранить существующие варианты/размеры (важно: `button.test.tsx` не должен сломаться — проверить классы в тесте).
- **`card.tsx`** — `rounded-2xl`, мягкая тень (`shadow-soft`), тоньше бордер, чуть больше паддинги.
- **`input.tsx`** — `rounded-xl`, заливка `bg-muted`, `h-11`.
- **`badge.tsx`** — НОВЫЙ примитив (cva): варианты `success`/`process`/`failed`/`neutral`/`income`/`expense`
  — пастельные пилюли как в референсе.
- **`modal.tsx`** — `rounded-2xl`, мягче тень/оверлей.
- Мелкие правки радиусов/отступов: `label.tsx`, `select.tsx`, `checkbox.tsx`, `form.tsx`.

## 3. App shell (новая структура)

- **`widgets/app-sidebar/`** — НОВЫЙ виджет: тёмный вертикальный бар (~72–80px), лого-марка сверху,
  иконочная навигация (lucide: дашборд, транзакции, категории, настройки), активное состояние, `title`-тултипы,
  снизу — выход. Берёт `pathname` (`usePathname`). `LogoutButton` встраивается сюда (доб. проп `variant`/иконка).
- **`widgets/app-header/ui/app-header.tsx`** — переделать в топ-бар: приветствие
  «Привет, {name} 👋» + подзаголовок, декоративный `Search`-инпут, чип аккаунта (аватар+имя). Хук `useCurrentUser` оставить.
- **`src/app/(app)/layout.tsx`** — сетка: `app-sidebar` (фикс. ширина) + основная колонка (топ-бар + контент),
  тёплый фон, скруглённый контейнер контента в духе референса.

## 4. Dashboard (главная)

- **`widgets/balance-overview/`** — НОВЫЙ: ряд карточек баланса — тёмная карточка «Баланс» (крупная сумма,
  графит + точечная текстура) + светлая карточка доход/расход за период. Данные — `totals` из
  `getTransactionsPage` (`@/entities/transaction`); локальный `model/`-хук на базе существующего API.
- **`widgets/quick-actions/`** — НОВЫЙ: плитки действий (круглая иконка + подпись), «Добавить доход/расход»
  открывают `CreateTransactionDialog` (`@/features/create-transaction`), ссылка на категории.
- **`widgets/statistics-panel/`** — НОВЫЙ: правая колонка — donut (CSS/SVG `conic-gradient`) доход vs расход,
  сумма в центре, легенда, мини-список последних операций со статус-бейджами. Данные — `totals` + `items`.
- **`widgets/recent-transactions/ui/recent-transactions.tsx`** — рестайл в таблицу («Последние транзакции»):
  колонки Отправитель/Дата/Статус/Сумма, бейджи, пагинация в новом стиле. Логику (`useRecentTransactions`) не трогаем.
- **`src/app/(app)/page.tsx`** — собрать дашборд в 2-колоночную адаптивную сетку:
  слева balance-overview + quick-actions + recent-transactions, справа statistics-panel; staggered `fade-up` на загрузке.
- **`src/app/(app)/transactions/page.tsx`** — заменить заглушку «Скоро» на `RecentTransactions` (полный список).
- **`src/app/(app)/categories/page.tsx`** — оставить `CategoryList`, при необходимости — сетка плиток.

## 5. Entities (карточки)

- **`entities/transaction/ui/transaction-card.tsx`** — рестайл под строку таблицы: иконка-кружок категории,
  описание+категория, дата, бейдж типа (доход/расход), сумма `tabular-nums` с цветом. Пропсы сохранить.
- **`entities/category/ui/category-card.tsx`** — рестайл в плитку/чип с цветным бейджем иконки.

## 6. Auth (вход/регистрация)

- **`src/app/(auth)/layout.tsx`** — split-screen: слева тёмная брендовая панель (лого, слоган, текстура),
  справа форма. Тёплый фон.
- **`src/app/(auth)/login/page.tsx`**, **`register/page.tsx`** — обновить под новый стиль карточки/типографики;
  формы (`LoginForm`/`RegisterForm`) переиспользуются, стиль приходит из обновлённых примитивов.

## 7. Docs

- **`apps/frontend/CLAUDE.md`** — обновить перечень виджетов в FSD-разделе (добавить app-sidebar,
  balance-overview, quick-actions, statistics-panel). README/`.claude/docs` не трогаем — стек, эндпоинты
  и top-level структура не меняются, новых зависимостей нет.

---

## Verification

1. `npm run typecheck -w apps/frontend` — без ошибок типов (учесть `noUncheckedIndexedAccess`).
2. `npm test -w apps/frontend` — Jest зелёный (особенно `button.test.tsx`).
3. `npm run lint -w apps/frontend` — без ошибок.
4. `npm run build:frontend` — прод-сборка проходит.
5. `npm run dev:frontend` (+ бэкенд `npm run dev:backend` для данных) и визуально проверить:
   - `/login`, `/register` — split-screen, новый стиль;
   - `/` — сайдбар, топ-бар, карточки баланса, quick-actions, таблица операций, donut-статистика;
   - `/transactions`, `/categories` — в новом стиле; адаптив (узкий экран — колонки стекаются).

## Notes
- Без новых npm-зависимостей (шрифты — next/font, иконки — lucide-react, donut — CSS/SVG).
- Логику, API-клиент, хуки и FSD-границы не меняем — только презентация и композиция.
- Копию этого плана положить в `apps/frontend`-проектный `.claude/plans/` при реализации (предпочтение пользователя).
