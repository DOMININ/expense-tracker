import { Type } from "class-transformer";
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Matches,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateIf,
} from "class-validator";

/** Значения пагинации по умолчанию, общие для DTO и обработчиков запросов. */
export const DEFAULT_PAGE = 1;
export const DEFAULT_LIMIT = 10;
export const MAX_LIMIT = 100;

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(6)
  password!: string;
}

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  @IsNotEmpty()
  password!: string;
}

export class AuthResponseDto {
  accessToken!: string;
}

export class UserResponseDto {
  id!: string;
  name!: string;
  email!: string;
}

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

export class CreateCategoryDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @IsString()
  @Matches(HEX_COLOR)
  color!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon!: string;
}

export class UpdateCategoryDto {
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name?: string;

  @IsOptional()
  @IsString()
  @Matches(HEX_COLOR)
  color?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  icon?: string;
}

export class CategoryResponseDto {
  id!: string;
  name!: string;
  color!: string;
  icon!: string;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export enum TransactionType {
  INCOME = "INCOME",
  EXPENSE = "EXPENSE",
}

export class CreateTransactionDto {
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount!: number;

  @IsEnum(TransactionType)
  type!: TransactionType;

  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description!: string;

  @IsDateString()
  date!: string;

  @IsString()
  @IsNotEmpty()
  categoryId!: string;
}

export class UpdateTransactionDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @IsPositive()
  amount?: number;

  @IsOptional()
  @IsEnum(TransactionType)
  type?: TransactionType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  description?: string;

  @IsOptional()
  @IsDateString()
  date?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  categoryId?: string;
}

export class ListTransactionsQueryDto {
  // month и year — пара «всё или ничего»: если задан один из них, второй
  // обязателен (ValidateIf запускает валидацию недостающего поля → 400).
  @ValidateIf((o) => o.month !== undefined || o.year !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @ValidateIf((o) => o.month !== undefined || o.year !== undefined)
  @Type(() => Number)
  @IsInt()
  @Min(1970)
  @Max(2100)
  year?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(MAX_LIMIT)
  limit?: number;
}

export class CategoryRefDto {
  id!: string;
  name!: string;
  color!: string;
  icon!: string;
}

export class TransactionResponseDto {
  id!: string;
  amount!: number;
  type!: TransactionType;
  description!: string;
  date!: Date;
  categoryId!: string;
  category!: CategoryRefDto;
  userId!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class TransactionTotalsDto {
  income!: number;
  expense!: number;
  balance!: number;
}

export class TransactionsListResponseDto {
  items!: TransactionResponseDto[];
  totals!: TransactionTotalsDto;
  page!: number;
  limit!: number;
  total!: number;
  totalPages!: number;
}
