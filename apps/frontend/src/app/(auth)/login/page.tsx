import Link from "next/link";
import { LoginForm } from "@/features/auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

export default function LoginPage() {
  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Вход</CardTitle>
        <CardDescription>Введите данные для входа в аккаунт</CardDescription>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
      <CardFooter className="justify-center text-sm text-muted-foreground">
        Нет аккаунта?&nbsp;
        <Link
          href="/register"
          className="text-primary underline-offset-4 hover:underline"
        >
          Зарегистрироваться
        </Link>
      </CardFooter>
    </Card>
  );
}
