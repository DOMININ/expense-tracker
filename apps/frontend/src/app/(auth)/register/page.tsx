import Link from "next/link";
import { RegisterForm } from "@/features/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function RegisterPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="font-display text-2xl tracking-tight">
          Регистрация
        </CardTitle>
        <CardDescription>Создайте аккаунт для отслеживания расходов</CardDescription>
      </CardHeader>
      <CardContent>
        <RegisterForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Уже есть аккаунт?&nbsp;
        <Link
          href="/login"
          className="text-primary underline-offset-4 hover:underline"
        >
          Войти
        </Link>
      </CardFooter>
    </Card>
  );
}
