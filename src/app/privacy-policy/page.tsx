import type { Metadata } from "next";
import LegalPage from "@/components/LegalPage";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Costco Savings Tracker collects, uses, and protects your information.",
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" updated="September 25, 2026">
      <p>
        Costco Savings Tracker (&ldquo;the site,&rdquo; &ldquo;we,&rdquo; &ldquo;us&rdquo;) is a free
        deals tool published by Kirkland Corner. This policy explains what
        information we collect when you use the site, how it&rsquo;s used, and
        the choices you have.
      </p>

      <h2>Information the tracker itself collects</h2>
      <p>
        None. Searching, filtering, and sorting deals all happen in your
        browser. What you type or select is never sent to or stored on our
        servers. There are no accounts or logins.
      </p>

      <h2>Analytics</h2>
      <p>
        We use Matomo, a web analytics service, to understand how visitors use
        the site (pages viewed, referring site, approximate location derived
        from IP address, device and browser type, and links clicked). Matomo
        may set cookies to distinguish visitors and sessions. This data is
        aggregated and used only to improve the site; it is not sold or used
        to identify you personally.
      </p>

      <h2>Newsletter signup</h2>
      <p>
        If you choose to subscribe to the Kirkland Corner newsletter through
        the embedded signup form, your email address is collected and
        processed directly by Substack, not by us. Substack&rsquo;s own{" "}
        <a href="https://substack.com/privacy" target="_blank" rel="noopener noreferrer">
          privacy policy
        </a>{" "}
        governs how they handle that information, and you can unsubscribe at
        any time using the link in any email you receive from them.
      </p>

      <h2>Advertising</h2>
      <p>
        This site displays ads served by Google AdSense. Google and its
        partners may use cookies and similar technologies to serve ads based
        on your prior visits to this and other websites. You can learn more
        about how Google uses this data and manage your ad personalization
        preferences at{" "}
        <a href="https://adssettings.google.com" target="_blank" rel="noopener noreferrer">
          Google Ads Settings
        </a>{" "}
        and read Google&rsquo;s own practices at{" "}
        <a
          href="https://policies.google.com/technologies/partner-sites"
          target="_blank"
          rel="noopener noreferrer"
        >
          How Google uses information from sites that use our services
        </a>
        . The site also includes affiliate links (for example, &ldquo;Compare on
        Amazon&rdquo; links on some deals). If you click one and make a purchase, we may earn a small
        commission at no extra cost to you.
      </p>

      <h2>Cookies</h2>
      <ul>
        <li>Analytics cookies (Matomo) to measure site usage</li>
        <li>Advertising cookies (Google AdSense) to serve and measure ads</li>
      </ul>
      <p>
        You can block or delete cookies through your browser settings at any
        time. Doing so may affect how some parts of the site function.
      </p>

      <h2>Your choices</h2>
      <p>
        You can opt out of personalized advertising through Google Ads
        Settings linked above, control cookies through your browser, and
        unsubscribe from the newsletter at any time. We do not sell personal
        information to third parties.
      </p>

      <h2>Children&rsquo;s privacy</h2>
      <p>
        This site is not directed at children under 13, and we do not
        knowingly collect personal information from children.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. Changes will be posted
        on this page with an updated revision date.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about this policy can be sent to{" "}
        <a href="mailto:kirklandcorner00@gmail.com">kirklandcorner00@gmail.com</a>.
      </p>
    </LegalPage>
  );
}
