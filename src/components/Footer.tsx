import Link from "next/link";
import { CATEGORIES, categorySlug } from "@/lib/categories";
import {
  CONTACT_EMAIL,
  COSTCO_SAVINGS_URL,
  INSTAGRAM_URL,
  KIRKLAND_CALC_URL,
  NEWSLETTER_URL,
} from "@/lib/site";

export default function Footer() {
  return (
    <footer className="border-t border-kc-ink/10 bg-kc-bg">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-kc-ink/70 sm:px-5">
        <nav aria-label="Browse by category" className="mb-8">
          <h2 className="font-display text-sm uppercase tracking-wide text-kc-blue">
            Browse by category
          </h2>
          <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 sm:grid-cols-4">
            {CATEGORIES.map((c) => (
              <li key={c}>
                <Link href={`/category/${categorySlug(c)}`} className="hover:text-kc-red hover:underline">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <p className="mb-4">
          <strong className="text-kc-ink">Disclaimer:</strong> Costco Savings Tracker is an
          independent, unofficial tool and is not affiliated with or endorsed by Costco
          Wholesale Corporation. Deals are copied from Costco&rsquo;s own{" "}
          <a
            href={COSTCO_SAVINGS_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-kc-red"
          >
            Warehouse Savings page
          </a>{" "}
          and shown at national level. Prices, availability, and limits vary by warehouse and
          can change, so always confirm in store or on Costco.com before you drive over.
        </p>
        <p className="mb-4 text-xs text-kc-ink/50">
          Some links are affiliate links: as an Amazon Associate, Kirkland Corner may earn from
          qualifying purchases, at no extra cost to you.
        </p>
        <p className="flex flex-wrap items-center gap-2">
          <span>
            Made with love (and a rotisserie chicken) by{" "}
            <a
              href={NEWSLETTER_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-kc-red hover:underline"
            >
              Kirkland Corner
            </a>
            . Deciding on a membership?{" "}
            <a href={KIRKLAND_CALC_URL} className="font-semibold text-kc-red hover:underline">
              Try Kirkland Calc
            </a>
            .
          </span>
          <a
            href={INSTAGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Kirkland Corner on Instagram"
            className="text-kc-ink/50 transition-colors hover:text-kc-red"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>
        </p>
        <p className="mt-3">
          Spotted a wrong price or missing deal?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="font-semibold text-kc-red hover:underline">
            {CONTACT_EMAIL}
          </a>
        </p>
        <div className="mt-4 flex gap-4 border-t border-kc-ink/10 pt-4 text-xs">
          <Link href="/privacy-policy" className="hover:text-kc-red hover:underline">
            Privacy Policy
          </Link>
          <Link href="/terms-of-service" className="hover:text-kc-red hover:underline">
            Terms of Service
          </Link>
        </div>
      </div>
    </footer>
  );
}
