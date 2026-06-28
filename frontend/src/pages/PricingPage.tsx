import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { SignInPromptModal } from "@/components/SignInPromptModal";
import { Check, X, Zap, Crown, Rocket, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { motion } from "framer-motion";

interface PlanFeature {
  name: string;
  seeker: string | boolean;
  hustler: string | boolean;
  closer: string | boolean;
}

const plans = [
  {
    id: "seeker",
    name: "Seeker",
    price: "Free",
    priceValue: 0,
    period: "forever",
    description: "Perfect for getting started with basic resume tools",
    icon: <Zap size={24} />,
    color: "bg-secondary text-foreground",
    buttonVariant: "outline" as const,
    popular: false,
  },
  {
    id: "hustler",
    name: "Hustler",
    price: "₹79",
    priceValue: 79,
    period: "/month",
    description: "For active job seekers who need more power",
    icon: <Crown size={24} />,
    color: "bg-secondary text-foreground",
    buttonVariant: "default" as const,
    popular: true,
  },
  {
    id: "closer",
    name: "Closer",
    price: "₹179",
    priceValue: 179,
    period: "/month",
    description: "For professionals serious about landing their dream job",
    icon: <Rocket size={24} />,
    color: "bg-secondary text-foreground",
    buttonVariant: "default" as const,
    popular: false,
  },
];

const comparisonFeatures: PlanFeature[] = [
  { name: "Resume Builder", seeker: true, hustler: true, closer: true },
  { name: "Resume Templates", seeker: "3 basic", hustler: "All 15+", closer: "All 15+ & Premium" },
  { name: "Resume Analysis", seeker: "3/month", hustler: "Unlimited", closer: "Unlimited" },
  { name: "Job Match Analysis", seeker: "3/month", hustler: "20/month", closer: "Unlimited" },
  { name: "Cover Letter Generator", seeker: "2/month", hustler: "10/month", closer: "Unlimited" },
  { name: "AI Assist (Writing)", seeker: "5 uses/month", hustler: "50 uses/month", closer: "Unlimited" },
  { name: "PDF Downloads", seeker: "3/month", hustler: "Unlimited", closer: "Unlimited" },
  { name: "Customization (Fonts/Colors)", seeker: true, hustler: true, closer: true },
  { name: "Style Presets (Themes)", seeker: false, hustler: true, closer: true },
  { name: "Layout Strategies", seeker: "1 basic", hustler: "All 6", closer: "All 6" },
  { name: "Match JD Feature", seeker: true, hustler: true, closer: true },
  { name: "Undo/Redo", seeker: false, hustler: true, closer: true },
  { name: "Priority Support", seeker: false, hustler: false, closer: true },
  { name: "Early Access to Features", seeker: false, hustler: false, closer: true },
  { name: "Referral Rewards", seeker: "Give 1, Get 1", hustler: "Give 2, Get 2", closer: "Give 3, Get 3" },
];

const faqItems = [
  {
    question: "Can I switch plans anytime?",
    answer: "Yes! You can upgrade or downgrade your plan at any time. Upgrades take effect immediately, and downgrades apply at the end of your current billing period.",
  },
  {
    question: "What payment methods do you accept?",
    answer: "We accept all major credit/debit cards, UPI, net banking, and wallets through our secure payment partner Razorpay.",
  },
  {
    question: "Is there a free trial for paid plans?",
    answer: "The Seeker plan is free forever with limited features. We recommend trying it first, then upgrading when you need more capacity.",
  },
  {
    question: "What happens when I exceed my monthly limits?",
    answer: "You'll see a prompt to upgrade your plan. Your existing resumes and data remain accessible — only new actions (analyses, generations) are limited until the next billing cycle.",
  },
  {
    question: "Can I cancel anytime?",
    answer: "Absolutely. Cancel anytime from your dashboard. Your paid features remain active until the end of the current billing period. See our Refund Policy for refund eligibility.",
  },
  {
    question: "Do unused credits roll over?",
    answer: "No, credits reset at the start of each billing cycle. This keeps our pricing simple and affordable.",
  },
];

export default function PricingPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handlePlanSelect = async (planId: string) => {
    if (!user) {
      setShowSignInModal(true);
      return;
    }
    if (planId === "seeker") {
      navigate("/dashboard");
      return;
    }

    try {
      // Create order on backend
      const res = await apiClient.post("/api/payments/create-order", { plan: planId });
      const { orderId, amount, currency, keyId, mock } = res.data;

      if (mock) {
        toast.success("Plan activated (development mode)! Redirecting to dashboard...");
        setTimeout(() => navigate("/dashboard"), 1500);
        return;
      }

      // Open Razorpay Checkout
      const rzp = new (window as any).Razorpay({
        key: keyId,
        amount,
        currency,
        name: "Resuvio-AI",
        description: `Upgrade to ${planId.charAt(0).toUpperCase() + planId.slice(1)} Plan`,
        order_id: orderId,
        handler: async (response: any) => {
          try {
            await apiClient.post("/api/payments/verify", {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });
            toast.success("Payment successful! Your plan has been upgraded.");
            navigate("/dashboard");
          } catch {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: user.displayName || "",
          email: user.email || "",
        },
        theme: {
          color: "#2563eb",
        },
        modal: {
          ondismiss: () => {
            toast.info("Payment cancelled. You can upgrade anytime.");
          },
        },
      });

      rzp.open();
    } catch {
      toast.error("Failed to initiate payment. Please try again.");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <section className="relative pt-24 pb-16 sm:pt-32 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-grid-pattern opacity-30" />
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-primary/10 to-transparent blur-3xl" />
        </div>
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container mx-auto px-4 sm:px-6 text-center relative z-10"
        >
          <div className="inline-flex items-center px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-primary text-xs sm:text-sm font-medium mb-6">
            <Zap size={14} className="mr-1.5" /> Simple, Transparent Pricing
          </div>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-4 font-heading">
            Invest in your <span className="gradient-text">career</span>
          </h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-2 leading-relaxed">
            Start free, upgrade when you're ready. No hidden fees, cancel anytime.
          </p>
          <p className="text-sm text-muted-foreground/60">
            All prices in INR (Indian Rupees). Billed monthly.
          </p>
        </motion.div>
      </section>

      {/* Pricing Cards */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                className="relative h-full"
              >
                {plan.popular && (
                  <div className="absolute -inset-[1px] bg-gradient-to-b from-primary to-blue-600 rounded-2xl opacity-50 blur-sm" />
                )}
                <Card
                  className={`relative h-full border-border/40 backdrop-blur-md bg-card/60 ${plan.popular ? "border-primary/50 shadow-2xl shadow-primary/10" : "hover:border-primary/30 hover:shadow-xl transition-all duration-300"}`}
                >
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-violet-600 to-blue-600 text-white text-[10px] font-bold px-4 py-1.5 rounded-full uppercase tracking-wider shadow-lg">
                      MOST POPULAR
                    </div>
                  )}
                  <CardHeader className="text-center pb-2 pt-8">
                    <div className={`inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/10 to-blue-500/10 text-primary mb-4 mx-auto`}>
                      {plan.icon}
                    </div>
                    <CardTitle className="text-xl sm:text-2xl font-bold">{plan.name}</CardTitle>
                    <div className="mt-3 mb-1">
                      <span className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight">{plan.price}</span>
                      <span className="text-sm text-muted-foreground ml-1 font-medium">{plan.period}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2 leading-relaxed">{plan.description}</p>
                  </CardHeader>
                  <CardContent className="pt-4 pb-8">
                    <Button
                      variant={plan.popular ? "default" : "outline"}
                      className={`w-full rounded-full h-12 text-sm font-semibold ${plan.popular ? "bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white" : "border-border/60 hover:bg-primary/5 hover:text-primary"}`}
                      onClick={() => handlePlanSelect(plan.id)}
                    >
                      {plan.priceValue === 0 ? "Get Started Free" : `Upgrade to ${plan.name}`}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Feature Comparison Table */}
      <section className="py-12 sm:py-20 md:py-24 relative">
        <div className="absolute inset-0 bg-secondary/30 skew-y-[-2deg] -z-10" />
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-10 sm:mb-16"
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 font-heading">
              Compare Features
            </h2>
            <p className="text-base sm:text-lg text-muted-foreground">See exactly what you get with each plan</p>
          </motion.div>

          <div className="max-w-5xl mx-auto overflow-x-auto rounded-2xl border border-border/40 shadow-xl bg-card/40 backdrop-blur-xl">
            <table className="w-full text-sm">
              <thead className="bg-muted/30 border-b border-border/40">
                <tr>
                  <th className="px-6 py-5 text-left font-semibold text-foreground">Feature</th>
                  <th className="px-4 py-5 text-center font-semibold text-foreground">Seeker</th>
                  <th className="px-4 py-5 text-center font-semibold text-primary">Hustler</th>
                  <th className="px-4 py-5 text-center font-semibold text-foreground">Closer</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/40">
                {comparisonFeatures.map((feature, idx) => (
                  <tr key={idx} className="transition-colors hover:bg-primary/5">
                    <td className="px-6 py-4 text-foreground font-medium">{feature.name}</td>
                    <td className="px-4 py-4 text-center">
                      <FeatureCell value={feature.seeker} />
                    </td>
                    <td className="px-4 py-4 text-center bg-primary/[0.02]">
                      <FeatureCell value={feature.hustler} isPro />
                    </td>
                    <td className="px-4 py-4 text-center">
                      <FeatureCell value={feature.closer} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-8 sm:py-12 md:py-16">
        <div className="container mx-auto px-4 sm:px-6 max-w-3xl">
          <div className="text-center mb-8 sm:mb-10">
            <div className="inline-flex items-center gap-2 mb-3">
              <HelpCircle size={20} className="text-foreground" />
              <h2 className="text-2xl sm:text-3xl font-bold text-foreground">
                Frequently Asked Questions
              </h2>
            </div>
            <p className="text-sm sm:text-base text-muted-foreground">
              Everything you need to know about our plans
            </p>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, idx) => (
              <AccordionItem key={idx} value={`faq-${idx}`}>
                <AccordionTrigger className="text-left text-sm sm:text-base text-foreground">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className="text-sm sm:text-base text-muted-foreground">
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 sm:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-primary/5 -z-10" />
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="container mx-auto px-4 sm:px-6 text-center max-w-3xl"
        >
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight mb-4 text-foreground font-heading">Ready to level up your career?</h2>
          <p className="text-lg sm:text-xl text-muted-foreground mb-8">
            Join thousands of professionals who've landed their dream jobs with Resuvio-AI.
          </p>
          <Button
            size="lg"
            className="rounded-full h-14 px-10 text-base font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-xl hover:shadow-primary/25 text-white transition-all duration-300 hover:scale-[1.02]"
            onClick={() => user ? navigate("/dashboard") : setShowSignInModal(true)}
          >
            {user ? "Go to Dashboard" : "Get Started For Free"}
          </Button>
        </motion.div>
      </section>

      <SignInPromptModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
}

/* Helper component for feature comparison table */
function FeatureCell({ value, isPro }: { value: string | boolean, isPro?: boolean }) {
  if (typeof value === "boolean") {
    return value ? (
      <Check size={18} className={`inline ${isPro ? 'text-primary' : 'text-foreground'}`} />
    ) : (
      <X size={18} className="inline text-muted-foreground/40" />
    );
  }
  return <span className={`text-xs sm:text-sm font-medium ${isPro ? 'text-primary' : 'text-foreground'}`}>{value}</span>;
}
