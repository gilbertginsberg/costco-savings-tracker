import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex-1 px-4 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">🔍</p>
      <h1 className="mt-3 font-display text-2xl uppercase tracking-wide text-kc-blue">
        Aisle not found
      </h1>
      <p className="mx-auto mt-2 max-w-md text-kc-ink/70">
        That page isn&rsquo;t on the shelves. Maybe it sold out.
      </p>
      <Link href="/" className="mt-4 inline-block font-semibold text-kc-red hover:underline">
        See this month&rsquo;s deals →
      </Link>
    </main>
  );
}
