"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Select } from "@/shared/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { sessionModel, useUnauthorizedHandler } from "@/entities/session";
import { getCategories, type Category } from "@/entities/category";
import { createTransaction } from "../api/create-transaction";

const schema = z.object({
  type: z.enum(["EXPENSE", "INCOME"]),
  amount: z
    .string()
    .min(1, "Введите сумму")
    .refine((v) => Number(v) > 0, "Сумма должна быть больше 0"),
  description: z
    .string()
    .min(1, "Введите описание")
    .max(200, "Не более 200 символов"),
  date: z.string().min(1, "Выберите дату"),
  categoryId: z.string().min(1, "Выберите категорию"),
});

type FormValues = z.infer<typeof schema>;

const today = () => new Date().toISOString().slice(0, 10);

export function CreateTransactionForm({ onSuccess }: { onSuccess: () => void }) {
  const handleUnauthorized = useUnauthorizedHandler();
  const [categories, setCategories] = useState<Category[] | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      type: "EXPENSE",
      amount: "",
      description: "",
      date: today(),
      categoryId: "",
    },
  });

  useEffect(() => {
    getCategories(sessionModel.getToken())
      .then(setCategories)
      .catch((e) => {
        if (handleUnauthorized(e)) return;
        setCategories([]);
      });
  }, [handleUnauthorized]);

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await createTransaction(sessionModel.getToken(), {
        amount: Number(values.amount),
        type: values.type,
        description: values.description,
        date: new Date(values.date).toISOString(),
        categoryId: values.categoryId,
      });
      onSuccess();
    } catch (e) {
      if (handleUnauthorized(e)) return;
      setServerError(
        e instanceof Error ? e.message : "Не удалось сохранить транзакцию",
      );
    }
  };

  if (categories === null) {
    return <p className="text-sm text-muted-foreground">Загрузка…</p>;
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Нет категорий. Сначала создайте категорию, чтобы добавить транзакцию.
      </p>
    );
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Тип</FormLabel>
              <FormControl>
                <Select {...field}>
                  <option value="EXPENSE">Расход</option>
                  <option value="INCOME">Доход</option>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Сумма</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  inputMode="decimal"
                  placeholder="0.00"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Описание</FormLabel>
              <FormControl>
                <Input placeholder="Например, продукты" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Дата</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Категория</FormLabel>
              <FormControl>
                <Select {...field}>
                  <option value="" disabled>
                    Выберите категорию
                  </option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </option>
                  ))}
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {serverError && (
          <p className="text-sm font-medium text-destructive">{serverError}</p>
        )}

        <Button
          type="submit"
          className="w-full"
          disabled={form.formState.isSubmitting}
        >
          {form.formState.isSubmitting ? "Сохранение…" : "Сохранить"}
        </Button>
      </form>
    </Form>
  );
}
