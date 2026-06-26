import { useRef, useState } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Button } from '@/components/ui/button';
import { Check, X, Zap, Crown, Rocket, ArrowRight } from 'lucide-react';

const plans = [
  {
    id: 'seeker',
    name: 'Seeker',
    description: 'Perfect for getting started',
    monthlyPrice: 0,
    yearlyPrice: 0,
    icon: Zap,
    popular: false,
    features: [
      { name: 'Resume Builder', included: true },
      { name: '3 Resume Templates', included: true },
      { name: '3 AI Analyses/month', included: true },
      { name: '3 PDF Downloads/month', included: true },
      { name: '5 AI Assist Uses/month', included: true },
      { name: 'Premium Templates', included: false },
      { name: 'Unlimited Analysis', included: false },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'hustler',
    name: 'Hustler',
    description: 'For active job seekers',
    monthlyPrice: 79,
    yearlyPrice: 59,
    icon: Crown,
    popular: true,
    features: [
      { name: 'Resume Builder', included: true },
      { name: 'All 15+ Templates', included: true },
      { name: 'Unlimited AI Analysis', included: true },
      { name: 'Unlimited PDF Downloads', included: true },
      { name: '50 AI Assist Uses/month', included: true },
      { name: 'Style Presets & Themes', included: true },
      { name: 'Undo/Redo History', included: true },
      { name: 'Priority Support', included: false },
    ],
  },
  {
    id: 'closer',
    name: 'Closer',
    description: 'For serious professionals',
    monthlyPrice: 179,
    yearlyPrice: 139,
    icon: Rocket,
    popular: false,
    features: [
      { name: 'Everything in Hustler', included: true },
      { name: 'Premium Templates', included: true },
      { name: 'Unlimited AI Assist', included: true },
      { name: 'Unlimited Cover Letters', included: true },
      { name: 'Advanced Analytics', included: true },
      { name: 'Priority Support', included: true },
      { name: 'Early Access Features', included: true },
      { name: 'All Layout Strategies', included: true },
    ],
  },
];

export function PricingSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [isYearly, setIsYearly] = useState(false);

  return (
    <section id="pricing" ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-6">
        <SectionHeading
          badge="Pricing"
          badgeIcon="💎"
          title="Simple, Transparent"
          titleHighlight="Pricing"
          subtitle="Start free, upgrade when you're ready. No hidden fees, cancel anytime."
        />

        {/* Toggle */}
        <motion.div
          className="flex items-center justify-center gap-4 mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <span className={`text-sm font-medium transition-colors ${!isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>Monthly</span>
          <button
            onClick={() => setIsYearly(!isYearly)}
            className={`relative w-14 h-7 rounded-full transition-colors duration-300 ${isYearly ? 'bg-gradient-to-r from-violet-500 to-blue-500' : 'bg-muted'}`}
          >
            <motion.div
              className="absolute top-1 w-5 h-5 rounded-full bg-white shadow-md"
              animate={{ left: isYearly ? '1.75rem' : '0.25rem' }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </button>
          <span className={`text-sm font-medium transition-colors ${isYearly ? 'text-foreground' : 'text-muted-foreground'}`}>
            Yearly
            <span className="ml-1.5 text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-semibold">Save 25%</span>
          </span>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          {plans.map((plan, i) => {
            const Icon = plan.icon;
            const price = isYearly ? plan.yearlyPrice : plan.monthlyPrice;

            return (
              <motion.div
                key={plan.id}
                className={`group relative rounded-2xl border bg-card/50 backdrop-blur-sm overflow-hidden transition-all duration-500 ${
                  plan.popular
                    ? 'border-primary/40 shadow-xl shadow-primary/10 scale-[1.02] md:scale-105'
                    : 'border-border/40 hover:border-primary/20'
                }`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
              >
                {/* Popular badge */}
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 via-blue-500 to-cyan-500" />
                )}

                <div className="p-6 sm:p-8">
                  {plan.popular && (
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gradient-to-r from-violet-500 to-blue-500 text-white mb-4">
                      Most Popular
                    </span>
                  )}

                  <div className="flex items-center gap-3 mb-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${plan.popular ? 'bg-primary/10' : 'bg-muted'}`}>
                      <Icon size={20} className={plan.popular ? 'text-primary' : 'text-muted-foreground'} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-foreground">{plan.name}</h3>
                      <p className="text-xs text-muted-foreground">{plan.description}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    <div className="flex items-baseline gap-1">
                      <span className="text-4xl font-bold text-foreground">
                        {price === 0 ? 'Free' : `₹${price}`}
                      </span>
                      {price > 0 && (
                        <span className="text-sm text-muted-foreground">/month</span>
                      )}
                    </div>
                    {isYearly && price > 0 && (
                      <p className="text-xs text-muted-foreground mt-1">
                        Billed ₹{price * 12}/year
                      </p>
                    )}
                  </div>

                  {/* CTA */}
                  <Button
                    onClick={onGetStarted}
                    className={`w-full rounded-xl h-11 font-semibold transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white'
                        : 'bg-secondary hover:bg-secondary/80 text-foreground'
                    }`}
                  >
                    {price === 0 ? 'Get Started Free' : `Upgrade to ${plan.name}`}
                    <ArrowRight size={16} className="ml-2" />
                  </Button>

                  {/* Features */}
                  <div className="mt-6 pt-6 border-t border-border/30 space-y-3">
                    {plan.features.map((feature) => (
                      <div key={feature.name} className="flex items-center gap-2.5">
                        {feature.included ? (
                          <div className="w-4 h-4 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0">
                            <Check size={10} className="text-emerald-500" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center shrink-0">
                            <X size={10} className="text-muted-foreground/50" />
                          </div>
                        )}
                        <span className={`text-sm ${feature.included ? 'text-foreground' : 'text-muted-foreground/50'}`}>
                          {feature.name}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Note */}
        <motion.p
          className="text-center text-xs text-muted-foreground mt-8"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ delay: 0.6 }}
        >
          All prices in INR. Billed monthly unless yearly selected.
        </motion.p>
      </div>
    </section>
  );
}
