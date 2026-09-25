import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: "The terms that govern your use of Costco Savings Tracker.",
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" updated="September 25, 2026">
      <p>
        By using Costco Savings Tracker (&ldquo;the site&rdquo;), you agree to the terms
        below. If you don&rsquo;t agree, please don&rsquo;t use the site.
      </p>

      <h2>What this is</h2>
      <p>
        Costco Savings Tracker is a free tool that makes Costco&rsquo;s
        official monthly Warehouse Savings list searchable and keeps an
        archive of past promo periods. It&rsquo;s published by Kirkland
        Corner as a companion to the Kirkland Corner newsletter.
      </p>

      <h2>Accuracy</h2>
      <p>
        Deal information is collected from Costco&rsquo;s public Warehouse
        Savings page and provided for informational purposes only. It may be
        incomplete, out of date, or contain errors introduced in processing.
        Prices, availability, limits, and promotion dates are set by Costco
        Wholesale Corporation, vary by location, and can change at any time.
        Costco Savings Tracker is an independent tool and is not affiliated
        with, endorsed by, or sponsored by Costco Wholesale Corporation.
        Always confirm current offers in your warehouse or at{" "}
        <a href="https://www.costco.com/o/-/warehouse-savings" target="_blank" rel="noopener noreferrer">
          Costco.com
        </a>{" "}
        before making a purchase.
      </p>

      <h2>Third-party services</h2>
      <p>
        The site embeds a newsletter signup form from Substack, displays ads
        served by Google AdSense, and includes affiliate links (such as
        &ldquo;Compare on Amazon&rdquo; links) that may earn us a commission on qualifying
        purchases. Your use of those features is also subject to the
        relevant third party&rsquo;s own terms and privacy policies. We
        aren&rsquo;t responsible for the content, availability, or practices
        of those third-party services.
      </p>

      <h2>Acceptable use</h2>
      <p>
        Don&rsquo;t use the site to do anything unlawful, attempt to disrupt
        or reverse engineer it, or scrape and republish its content without
        permission.
      </p>

      <h2>No warranties</h2>
      <p>
        The site is provided &ldquo;as is&rdquo; and &ldquo;as available,&rdquo;
        without warranties of any kind, express or implied, including
        accuracy, reliability, or fitness for a particular purpose.
      </p>

      <h2>Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Kirkland Corner and Costco
        Savings Tracker are not liable for any indirect, incidental, or consequential
        damages arising from your use of the site or reliance on its
        information.
      </p>

      <h2>Changes</h2>
      <p>
        We may update the site or these terms at any time. Continued use of
        the site after changes are posted means you accept the updated terms.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about these terms can be sent to{" "}
        <a href="mailto:kirklandcorner00@gmail.com">kirklandcorner00@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
