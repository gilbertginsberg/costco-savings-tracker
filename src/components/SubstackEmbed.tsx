import { NEWSLETTER_URL } from "@/lib/site";

export default function SubstackEmbed() {
  return (
    <section className="rounded-2xl border-2 border-kc-blue bg-white p-5 shadow-sm sm:p-6">
      <h2 className="font-display text-xl uppercase tracking-wide text-kc-blue">
        Get the best of each month&rsquo;s deals in your inbox
      </h2>
      <p className="mt-1 text-sm text-kc-ink/70">
        Kirkland Corner picks the savings actually worth a trip, plus hacks and hot takes on
        which Kirkland Signature dupes live up to the hype. Free, and you can unsubscribe any
        time.
      </p>
      <div className="mt-4 overflow-hidden rounded-lg border border-kc-ink/10 bg-white">
        <iframe
          src={`${NEWSLETTER_URL}/embed`}
          width="100%"
          height="320"
          style={{ border: "1px solid #EEE", background: "white", display: "block" }}
          frameBorder="0"
          scrolling="no"
          title="Subscribe to Kirkland Corner"
          loading="lazy"
        />
      </div>
      <p className="mt-3 text-center text-xs text-kc-ink/50">
        Having trouble with the form?{" "}
        <a
          href={`${NEWSLETTER_URL}/subscribe`}
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-kc-red hover:underline"
        >
          Subscribe directly on Substack →
        </a>
      </p>
    </section>
  );
}
