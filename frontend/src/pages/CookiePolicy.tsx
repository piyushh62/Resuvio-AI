import { Link } from "react-router-dom";
import { Cookie, ArrowLeft } from "lucide-react";

export default function CookiePolicy() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="py-10 sm:py-14 md:py-16 bg-secondary">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <div className="inline-flex items-center px-3 py-1 rounded-full bg-card text-foreground text-xs sm:text-sm font-medium mb-4">
            <Cookie size={14} className="mr-1.5" /> Legal
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground mb-2">
            Cookie Policy
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground">Last updated: June 20, 2026</p>
        </div>
      </section>

      {/* Content */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="space-y-8 text-sm sm:text-base text-foreground leading-relaxed">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">1. What Are Cookies</h2>
              <p>
                Cookies are small text files stored on your device when you visit a website. They help the website remember your preferences and provide a better experience. We also use similar technologies like local storage for the same purposes.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">2. How We Use Cookies</h2>
              <p className="mb-2">We use cookies for the following purposes:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Authentication:</strong> To keep you signed in and verify your identity (Firebase Authentication tokens stored in local storage).</li>
                <li><strong>Session Management:</strong> To maintain your session as you navigate between pages.</li>
                <li><strong>Preferences:</strong> To remember your settings and preferences within the application.</li>
                <li><strong>Analytics:</strong> To understand how visitors interact with our website and improve our services.</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">3. Types of Cookies We Use</h2>
              
              {/* Table */}
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="w-full text-sm bg-card">
                  <thead className="bg-secondary">
                    <tr>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Purpose</th>
                      <th className="px-4 py-3 text-left font-semibold text-foreground">Duration</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Essential</td>
                      <td className="px-4 py-3 text-muted-foreground">Authentication, security, session management</td>
                      <td className="px-4 py-3 text-muted-foreground">Session / 1 hour</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Functional</td>
                      <td className="px-4 py-3 text-muted-foreground">User preferences, settings persistence</td>
                      <td className="px-4 py-3 text-muted-foreground">1 year</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-3 font-medium text-foreground">Analytics</td>
                      <td className="px-4 py-3 text-muted-foreground">Usage patterns, performance monitoring</td>
                      <td className="px-4 py-3 text-muted-foreground">Up to 2 years</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">4. Local Storage</h2>
              <p>
                In addition to cookies, we use browser local storage to store your Firebase authentication token (<code className="bg-secondary px-1.5 py-0.5 rounded text-xs text-foreground">firebaseIdToken</code>) and application preferences. This data persists until you log out or clear your browser data.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">5. Third-Party Cookies</h2>
              <p className="mb-2">
                We may use third-party services that set their own cookies:
              </p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Google (Firebase):</strong> Authentication and analytics cookies</li>
                <li><strong>Razorpay:</strong> Payment processing cookies during checkout</li>
                <li><strong>YouTube:</strong> Embedded video cookies on our Help page</li>
              </ul>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">6. Managing Cookies</h2>
              <p className="mb-2">You can control and manage cookies in several ways:</p>
              <ul className="list-disc pl-6 space-y-1">
                <li><strong>Browser Settings:</strong> Most browsers allow you to view, manage, and delete cookies. Check your browser's help section for instructions.</li>
                <li><strong>Opt-Out:</strong> You can opt out of analytics cookies while still using the essential features of our Service.</li>
                <li><strong>Do Not Track:</strong> Some browsers have a "Do Not Track" feature that lets you tell websites not to track your online activity.</li>
              </ul>
              <p className="mt-3 text-muted-foreground">
                Please note that blocking essential cookies may prevent you from using certain features of our Service, such as staying logged in.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">7. Changes to This Policy</h2>
              <p>
                We may update this Cookie Policy from time to time. Changes will be posted on this page with an updated "Last Updated" date.
              </p>
            </div>

            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-3">8. Contact Us</h2>
              <p>
                If you have questions about our use of cookies, contact us at{" "}
                <a href="mailto:privacy@aicareerforge.com" className="text-foreground hover:underline">
                  privacy@aicareerforge.com
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
