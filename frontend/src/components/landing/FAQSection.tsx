import { useRef, useState } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { ChevronDown, Search } from 'lucide-react';

const faqs = [
  {
    q: "Is Resuvio-AI really free?",
    a: "Yes, the core features are free forever. The Seeker plan includes resume building, 3 AI analyses per month, and PDF downloads. We also offer Pro tiers for power users who want unlimited AI generations, premium templates, and advanced analytics.",
  },
  {
    q: "How does the AI resume analysis work?",
    a: "We use Google's Gemini AI to analyze your resume against job descriptions, identify missing keywords, suggest stronger bullet points, and score ATS compatibility. The AI provides actionable, specific feedback — not generic advice.",
  },
  {
    q: "Is my data secure?",
    a: "Absolutely. We use Firebase authentication, encrypted storage, and never share or sell your personal data. Your resumes are stored securely and you can delete your account and all data at any time.",
  },
  {
    q: "Can I export my resume as a PDF?",
    a: "Yes! You can download your resume in PDF format with any of our plans. The formatting is optimized for ATS compatibility while maintaining a professional, clean design.",
  },
  {
    q: "Do I need to create an account?",
    a: "You can browse templates and read our blog without an account, but to build, save, and download resumes you'll need a free account. Sign up takes less than 30 seconds.",
  },
  {
    q: "What makes Resuvio-AI different from other resume builders?",
    a: "Unlike generic builders, Resuvio-AI uses advanced AI to actively improve your content — rewriting bullet points, quantifying achievements, and optimizing for specific job descriptions. It's like having a career coach and copywriter combined.",
  },
  {
    q: "Can I cancel my subscription anytime?",
    a: "Yes, you can cancel anytime from your dashboard. Your paid features remain active until the end of the current billing period. No questions asked, no hidden cancellation fees.",
  },
];

export function FAQSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredFaqs = faqs.filter(
    (faq) =>
      faq.q.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.a.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <section ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-primary/5 rounded-full blur-[120px]" />
      </div>

      <div className="container mx-auto px-6 max-w-3xl">
        <SectionHeading
          badge="FAQ"
          badgeIcon="❓"
          title="Frequently Asked"
          titleHighlight="Questions"
          subtitle="Everything you need to know about Resuvio-AI."
        />

        {/* Search */}
        <motion.div
          className="relative mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ delay: 0.2 }}
        >
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search questions..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-all duration-300"
          />
        </motion.div>

        {/* FAQ items */}
        <div className="space-y-3">
          {filteredFaqs.map((faq, i) => {
            const isOpen = openIndex === i;

            return (
              <motion.div
                key={faq.q}
                className="rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm overflow-hidden transition-colors duration-300 hover:border-primary/20"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.4, delay: 0.1 + i * 0.05 }}
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : i)}
                  className="w-full text-left px-6 py-4 flex items-center justify-between gap-4 transition-colors hover:bg-muted/30"
                >
                  <span className="font-medium text-foreground text-sm sm:text-base">{faq.q}</span>
                  <motion.div
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.3 }}
                    className="shrink-0"
                  >
                    <ChevronDown size={18} className="text-muted-foreground" />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    >
                      <div className="px-6 pb-4 text-sm text-muted-foreground leading-relaxed border-t border-border/30 pt-3">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            );
          })}
        </div>

        {filteredFaqs.length === 0 && (
          <motion.p
            className="text-center text-muted-foreground text-sm py-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            No questions found matching "{searchQuery}". Try a different search.
          </motion.p>
        )}
      </div>
    </section>
  );
}
