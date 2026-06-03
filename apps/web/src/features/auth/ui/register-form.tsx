"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/shared/ui/button";
import { Input } from "@/shared/ui/input";
import { Checkbox } from "@/shared/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/ui/form";
import { authApi } from "../api";
import { sessionModel } from "@/entities/session";

const schema = z.object({
  name: z.string().min(1, "Введите имя"),
  email: z.string().email("Некорректный email"),
  password: z
    .string()
    .min(6, "Пароль должен содержать не менее 6 символов"),
  terms: z
    .boolean()
    .refine((v) => v === true, "Примите пользовательское соглашение и политику обработки данных, чтобы продолжить"),
});

type FormValues = z.infer<typeof schema>;

export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", email: "", password: "", terms: false },
  });

  const onSubmit = async (values: FormValues) => {
    setServerError(null);
    try {
      const { accessToken } = await authApi.register(values);
      sessionModel.setToken(accessToken);
      router.push("/");
    } catch (e) {
      setServerError(
        e instanceof Error ? e.message : "Произошла ошибка. Попробуйте снова.",
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
              <FormLabel>Имя</FormLabel>
              <FormControl>
                <Input
                  placeholder="Иван Иванов"
                  autoComplete="name"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  autoComplete="email"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Пароль</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="••••••"
                  autoComplete="new-password"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="terms"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start gap-3 space-y-0">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
              <div className="space-y-1 leading-none">
                <FormLabel className="text-sm font-normal leading-snug">
                  Согласен с{" "}
                  <Link
                    href="/terms"
                    className="underline underline-offset-2 hover:text-foreground"
                    target="_blank"
                  >
                    пользовательским соглашением
                  </Link>{" "}
                  и{" "}
                  <Link
                    href="/privacy"
                    className="underline underline-offset-2 hover:text-foreground"
                    target="_blank"
                  >
                    политикой обработки данных
                  </Link>
                </FormLabel>
                <FormMessage />
              </div>
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
          {form.formState.isSubmitting ? "Регистрация..." : "Зарегистрироваться"}
        </Button>
      </form>
    </Form>
  );
}
