/** Shown whenever the page is rendering bundled preview data, not real deals. */
export default function SampleDataNotice() {
  return (
    <div role="note" className="border-b-2 border-kc-red bg-kc-red/10 px-4 py-2 text-center text-sm text-kc-red-dark">
      <strong>Preview with sample data.</strong> These are illustrative listings, not real Costco
      offers. Real deals appear after the first scheduled fetch.
    </div>
  );
}
