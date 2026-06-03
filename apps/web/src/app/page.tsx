import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen p-8">
      <h1 className="text-2xl font-semibold">Expence Tracker</h1>
      <div className="mt-4 flex gap-4">
        <Link href="/login" className="text-primary underline-offset-4 hover:underline">
          Войти
        </Link>
        <Link href="/register" className="text-primary underline-offset-4 hover:underline">
          Зарегистрироваться
        </Link>
      </div>
    </main>
  );
}
