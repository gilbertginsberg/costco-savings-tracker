export default function NoData() {
  return (
    <main className="flex-1 px-4 py-20 text-center">
      <p className="text-4xl" aria-hidden="true">📦</p>
      <h1 className="mt-3 font-display text-2xl uppercase tracking-wide text-kc-blue">
        Stocking the shelves
      </h1>
      <p className="mx-auto mt-2 max-w-md text-kc-ink/70">
        No promo periods have been fetched yet. Check back soon.
      </p>
    </main>
  );
}
