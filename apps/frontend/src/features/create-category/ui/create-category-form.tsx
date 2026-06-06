"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { sessionModel, useUnauthorizedHandler } from "@/entities/session";
import { createCategory } from "../api/create-category";

const HEX_COLOR = /^#[0-9A-Fa-f]{6}$/;

const ICON_PRESETS = ["🍔", "🚕", "🏠", "🛒", "💊", "🎁", "💼", "✈️", "📱", "💰"];

const schema = z.object({
  name: z
    .string()
    .min(1, "Введите название")
    .max(50, "Не более 50 символов"),
  color: z.string().regex(HEX_COLOR, "Цвет в формате #RRGGBB"),
  icon: z
    .string()
    .min(1, "Укажите иконку")
    .max(50, "Не более 50 символов"),
});

type FormValues = z.infer<typeof schema>;

export function CreateCategoryForm({ onSuccess }: { onSuccess: () => void }) {
  const handleUnauthorized = useUnauthorizedHandler();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", color: "#3b82f6", icon: "" },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      await createCategory(sessionModel.getToken(), values);
      onSuccess();
    } catch (e) {
      if (handleUnauthorized(e)) return;
      setServerError(
        e instanceof Error ? e.message : "Не удалось сохранить категорию",
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Название</FormLabel>
              <FormControl>
                <Input placeholder="Например, продукты" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="color"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Цвет</FormLabel>
              <FormControl>
                <div className="flex items-center gap-3">
                  <Input
                    type="color"
                    className="h-10 w-16 cursor-pointer p-1"
                    {...field}
                  />
                  <span className="text-sm text-muted-foreground">
                    {field.value}
                  </span>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="icon"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Иконка</FormLabel>
              <FormControl>
                <Input placeholder="Эмодзи, например 🍔" {...field} />
              </FormControl>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {ICON_PRESETS.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() =>
                      form.setValue("icon", emoji, { shouldValidate: true })
                    }
                    className="flex h-9 w-9 items-center justify-center rounded-md border text-base hover:bg-muted"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
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
