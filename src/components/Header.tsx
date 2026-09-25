import Link from "next/link";
import { KIRKLAND_CALC_URL, NEWSLETTER_URL } from "@/lib/site";

export default function Header() {
  return (
    <header className="bg-kc-blue text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-4 sm:px-5">
        <Link href="/" className="flex flex-col leading-tight">
          <span className="font-display text-xl uppercase tracking-wide text-white">
            Costco Savings Tracker
          </span>
          <span className="text-xs text-white/60">by Kirkland Corner</span>
        </Link>
        <nav className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm font-medium">
          <Link href="/" className="text-white/85 hover:text-white">
            This month
          </Link>
          <Link href="/archive" className="text-white/85 hover:text-white">
            Archive
          </Link>
          <a href={KIRKLAND_CALC_URL} className="text-white/85 hover:text-white">
            Kirkland Calc
          </a>
          <a
            href={NEWSLETTER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-white/30 px-4 py-1.5 text-white transition-colors hover:bg-white/10"
          >
            Newsletter →
          </a>
        </nav>
      </div>
    </header>
  );
}
