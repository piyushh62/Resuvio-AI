import { Link } from "react-router-dom";
import { FileText, ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-10 sm:py-14 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-card text-foreground text-xs sm:text-sm font-medium mb-4">
            <FileText size={14} className="mr-1.5" /> Legal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
            Terms of Service
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Last updated: June 20, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="space-y-8 text-sm sm:text-base text-foreground leading-relaxed">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. Acceptance of Terms</h2>
              <p>
                By accessing and using Resuvio-AI ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service. These terms apply to all visitors, users, and others who access or use the Service.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. Description of Service</h2>
              <p>
                Resuvio-AI provides AI-powered career tools including resume analysis, resume building, job matching, cover letter generation, and related career optimization features. The Service is available through our website at resuvio.ai.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. User Accounts</h2>
              <ul className="list-disc pl-6 space-y-1">
                <li>You must be at least 16 years old to create an account.</li>
                <li>You are responsible for maintaining the confidentiality of your account credentials.</li>
                <li>You are responsible for all activities that occur under your account.</li>
                <li>You must notify us immediately of any unauthorized use of your account.</li>
                <li>We reserve the right to suspend or terminate accounts that violate these terms.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. Subscription Plans & Payments</h2>
              <p className="mb-2">
                We offer free and paid subscription tiers. By subscribing to a paid plan:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You agree to pay the applicable fees as displayed on our Pricing page.</li>
                <li>Subscriptions are billed monthly and auto-renew unless cancelled.</li>
                <li>Cancellations take effect at the end of the current billing period.</li>
                <li>Payments are processed securely through Razorpay.</li>
                <li>Refunds are governed by our{" "}<Link to="/refund-policy" className="text-foreground hover:underline">Refund Policy</Link>.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Usage Limits & Credits</h2>
              <p>
                Free and paid plans have usage limits for certain features (e.g., resume analyses, cover letter generations). These limits reset monthly. We reserve the right to modify limits with reasonable notice. Exceeding your plan's limits may require an upgrade.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. User Content</h2>
              <p className="mb-2">Regarding content you upload or create using our Service:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>You retain ownership of all content you upload or create.</li>
                <li>You grant us a limited license to process your content solely to provide the Service.</li>
                <li>You are responsible for ensuring you have the right to use any content you upload.</li>
                <li>You must not upload content that is illegal, offensive, or infringes others' rights.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">7. AI-Generated Content</h2>
              <p>
                Our Service uses artificial intelligence (Google Gemini) to generate suggestions, analyses, and content. AI-generated content is provided as guidance only. You are responsible for reviewing and editing AI-generated content before using it in job applications. We do not guarantee the accuracy, completeness, or suitability of AI-generated content.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">8. Prohibited Uses</h2>
              <p className="mb-2">You agree not to:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li>Use the Service for any illegal purpose or in violation of any laws</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Use automated bots or scrapers to access the Service</li>
                <li>Share your account credentials with third parties</li>
                <li>Resell or redistribute content generated by the Service as a competing product</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">9. Intellectual Property</h2>
              <p>
                The Service, including its design, features, and underlying code, is owned by Resuvio-AI and protected by intellectual property laws. Our trademarks, logos, and brand assets may not be used without prior written consent.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">10. Disclaimer of Warranties</h2>
              <p>
                The Service is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, error-free, or that your use of the Service will achieve any particular outcome (e.g., getting a job interview).
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">11. Limitation of Liability</h2>
              <p>
                To the maximum extent permitted by law, Resuvio-AI shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Service. Our total liability shall not exceed the amount you paid us in the 12 months preceding the claim.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">12. Termination</h2>
              <p>
                We may terminate or suspend your access to the Service at any time for conduct that violates these Terms or is harmful to other users. You may terminate your account at any time by contacting us. Upon termination, your right to use the Service ceases immediately.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">13. Changes to Terms</h2>
              <p>
                We reserve the right to modify these Terms at any time. Material changes will be communicated via email or a prominent notice on our site. Continued use of the Service after changes constitutes acceptance of the modified Terms.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">14. Contact Us</h2>
              <p>
                For questions about these Terms, contact us at{" "}
                <a href="mailto:legal@aicareerforge.com" className="text-foreground hover:underline">
                  legal@aicareerforge.com
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
