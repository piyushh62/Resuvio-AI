import { Link } from "react-router-dom";
import { RotateCcw, ArrowLeft } from "lucide-react";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-10 sm:py-14 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-card text-foreground text-xs sm:text-sm font-medium mb-4">
            <RotateCcw size={14} className="mr-1.5" /> Legal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
            Refund Policy
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Last updated: June 20, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="space-y-8 text-sm sm:text-base text-foreground leading-relaxed">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. Overview</h2>
              <p>
                At Resuvio-AI, we want you to be satisfied with your subscription. This Refund Policy outlines the conditions under which refunds may be issued for our paid plans (Hustler and Closer).
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. Free Plan (Seeker)</h2>
              <p>
                The Seeker plan is free of charge. Since no payment is involved, refunds are not applicable to this plan.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. Paid Plans (Hustler & Closer)</h2>
              <p className="mb-3 text-muted-foreground">Refund requests for paid plans are considered under the following conditions:</p>

              {/* Refund conditions table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm bg-card">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Condition</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Refund Eligible</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Technical issues preventing access to paid features (verified by our team)</td>
                      <td className="px-4 py-3 text-foreground font-medium">Yes - Full refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Duplicate or accidental payment</td>
                      <td className="px-4 py-3 text-foreground font-medium">Yes - Full refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Change of mind within 3 days of purchase (minimal usage)</td>
                      <td className="px-4 py-3 text-foreground font-medium">Yes - Pro-rata refund</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Service not meeting expectations (after significant usage)</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">No</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 text-muted-foreground">Request made after 7 days of purchase</td>
                      <td className="px-4 py-3 text-muted-foreground font-medium">No</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. How to Request a Refund</h2>
              <p className="mb-2 text-muted-foreground">To request a refund, please:</p>
              <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
                <li>Email us at <a href="mailto:billing@aicareerforge.com" className="text-foreground hover:underline">billing@aicareerforge.com</a></li>
                <li>Include your registered email address and the date of purchase</li>
                <li>Describe the reason for your refund request</li>
                <li>Our team will review your request within 3-5 business days</li>
                <li>If approved, the refund will be processed to your original payment method within 7-10 business days</li>
              </ol>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Cancellation</h2>
              <p className="text-muted-foreground">
                You can cancel your subscription at any time from your dashboard. Upon cancellation:
              </p>
              <ul className="list-disc pl-6 space-y-1 mt-2 text-muted-foreground">
                <li>Your paid features remain active until the end of the current billing period</li>
                <li>No further charges will be made after cancellation</li>
                <li>Your data and created resumes remain accessible under the free plan limits</li>
                <li>Cancellation does not constitute a refund — please see Section 3 for refund eligibility</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. Exceptions</h2>
              <p className="text-muted-foreground">
                In rare cases, we may make exceptions to this policy at our sole discretion. If you have extenuating circumstances, please reach out to us and we'll do our best to help.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">7. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Refund Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">8. Contact Us</h2>
              <p className="text-muted-foreground">
                For refund requests or questions, contact us at{" "}
                <a href="mailto:billing@aicareerforge.com" className="text-foreground hover:underline">
                  billing@aicareerforge.com
                </a>{" "}
                or visit our{" "}
                <Link to="/contact" className="text-foreground hover:underline">Contact page</Link>.
              </p>
            </div>
          </div>

          {/* Back Link */}
          <div className="mt-10 sm:mt-12 pt-6 border-t border-border">
            <Link
              to="/"
              className="inline-flex items-center text-sm text-foreground hover:text-muted-foreground font-medium"
            >
              <ArrowLeft size={16} className="mr-1.5" /> Back to Home
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
