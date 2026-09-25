import type { ReactNode } from "react";

export default function LegalPage({
  title,
  updated,
  children,
}: {
  title: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <main className="flex-1 bg-white px-5 py-14">
      <div className="mx-auto max-w-2xl">
        <h1 className="font-display text-3xl uppercase tracking-wide text-kc-blue">
          {title}
        </h1>
        <p className="mt-2 text-sm text-kc-ink/50">Last updated: {updated}</p>
        <div className="mt-8 space-y-6 text-kc-ink/80 [&_a]:text-kc-red [&_a]:underline [&_a:hover]:text-kc-red-dark [&_h2]:mt-8 [&_h2]:font-display [&_h2]:text-lg [&_h2]:uppercase [&_h2]:tracking-wide [&_h2]:text-kc-blue [&_li]:ml-5 [&_li]:list-disc [&_p]:leading-relaxed [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </main>
  );
}
