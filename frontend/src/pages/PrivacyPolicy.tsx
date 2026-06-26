import { Link } from "react-router-dom";
import { Shield, ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-10 sm:py-14 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-card text-foreground text-xs sm:text-sm font-medium mb-4">
            <Shield size={14} className="mr-1.5" /> Legal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Last updated: June 20, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="prose prose-slate max-w-none">
            <div className="space-y-8 text-sm sm:text-base text-foreground leading-relaxed">
              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. Introduction</h2>
                <p>
                  Welcome to Resuvio-AI ("we," "us," or "our"). We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit our website and use our services.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. Information We Collect</h2>
                <p className="mb-2">We collect information that you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Account Information:</strong> Name, email address, and password when you create an account.</li>
                  <li><strong>Resume Data:</strong> The content of resumes you upload or create using our builder.</li>
                  <li><strong>Usage Data:</strong> How you interact with our services, including features used and files uploaded.</li>
                  <li><strong>Payment Information:</strong> Billing details when you subscribe to paid plans (processed securely via Razorpay).</li>
                  <li><strong>Communication Data:</strong> Messages you send via our contact form.</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. How We Use Your Information</h2>
                <p className="mb-2">We use the collected information to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process AI analysis of your resumes to provide optimization suggestions</li>
                  <li>Generate cover letters and job match scores</li>
                  <li>Process transactions and send payment confirmations</li>
                  <li>Send you technical notices, updates, and support messages</li>
                  <li>Respond to your comments, questions, and requests</li>
                  <li>Monitor and analyze trends, usage, and activities</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. Data Storage & Security</h2>
                <p>
                  Your data is stored securely using Firebase/Firestore with encryption at rest and in transit. We implement industry-standard security measures including Firebase Authentication for identity verification. However, no method of transmission over the Internet is 100% secure, and we cannot guarantee absolute security.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Data Sharing & Third Parties</h2>
                <p className="mb-2">We do not sell your personal data. We may share your information with:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li><strong>Service Providers:</strong> Firebase (data storage), Google Gemini (AI processing), Razorpay (payments)</li>
                  <li><strong>Legal Requirements:</strong> When required by law, court order, or governmental regulation</li>
                  <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
                </ul>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. Your Rights</h2>
                <p className="mb-2">You have the right to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Access and receive a copy of your personal data</li>
                  <li>Rectify or update any inaccurate personal data</li>
                  <li>Request deletion of your personal data and account</li>
                  <li>Object to or restrict certain processing activities</li>
                  <li>Export your data in a portable format</li>
                </ul>
                <p className="mt-2">
                  To exercise any of these rights, contact us at{" "}
                  <a href="mailto:privacy@aicareerforge.com" className="text-foreground hover:underline">
                    privacy@aicareerforge.com
                  </a>.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">7. Cookies</h2>
                <p>
                  We use essential cookies for authentication and session management. We may also use analytics cookies to understand how visitors interact with our site. You can control cookie preferences through your browser settings. See our{" "}
                  <Link to="/cookies" className="text-foreground hover:underline">Cookie Policy</Link> for details.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">8. Children's Privacy</h2>
                <p>
                  Our services are not directed to individuals under 16. We do not knowingly collect personal information from children under 16. If we learn we have collected such information, we will take steps to delete it promptly.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">9. Changes to This Policy</h2>
                <p>
                  We may update this Privacy Policy from time to time. We will notify you of material changes by posting the updated policy on this page with a new "Last Updated" date. Continued use of our services after changes constitutes acceptance.
                </p>
              </div>

              <div>
                <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">10. Contact Us</h2>
                <p>
                  If you have questions about this Privacy Policy, please contact us at{" "}
                  <a href="mailto:privacy@aicareerforge.com" className="text-foreground hover:underline">
                    privacy@aicareerforge.com
                  </a>{" "}
                  or visit our{" "}
                  <Link to="/contact" className="text-foreground hover:underline">Contact page</Link>.
                </p>
              </div>
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
