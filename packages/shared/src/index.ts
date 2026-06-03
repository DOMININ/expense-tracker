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
} from "class-validator";

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
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(12)
  month?: number;

  @IsOptional()
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
  @Max(100)
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
