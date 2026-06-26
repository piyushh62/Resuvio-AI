import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles, Github, Star } from 'lucide-react';

export function CTASection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      {/* Gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-600/5 via-blue-600/5 to-cyan-500/5" />
      <div className="absolute inset-0 bg-grid-pattern opacity-30" />

      {/* Floating blobs */}
      <motion.div
        className="absolute w-[300px] h-[300px] rounded-full blur-[100px] opacity-20"
        style={{ background: 'linear-gradient(135deg, hsl(262 83% 58% / 0.4), hsl(217 91% 60% / 0.3))', top: '10%', left: '10%' }}
        animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute w-[250px] h-[250px] rounded-full blur-[80px] opacity-15"
        style={{ background: 'linear-gradient(135deg, hsl(192 91% 36% / 0.3), hsl(262 83% 58% / 0.2))', bottom: '10%', right: '10%' }}
        animate={{ x: [0, -20, 0], y: [0, 20, 0], scale: [1, 0.95, 1] }}
        transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
      />

      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          className="max-w-3xl mx-auto text-center"
          initial={{ opacity: 0, y: 30 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-8"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={isInView ? { opacity: 1, scale: 1 } : {}}
            transition={{ delay: 0.1 }}
          >
            <Sparkles size={14} />
            Ready to transform your career?
          </motion.div>

          <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-foreground mb-6 font-heading">
            Your Dream Job Is{' '}
            <span className="gradient-text">One Resume Away</span>
          </h2>

          <p className="text-lg text-muted-foreground mb-10 max-w-xl mx-auto">
            Join thousands of professionals who've landed interviews at top companies. Start building for free today.
          </p>

          {/* CTA buttons */}
          <motion.div
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-10"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : {}}
            transition={{ delay: 0.3 }}
          >
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group rounded-full px-10 h-14 text-base font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-xl hover:shadow-primary/25 text-white transition-all duration-300 hover:scale-[1.02]"
            >
              <Sparkles size={18} className="mr-2" />
              Get Started — It's Free
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => window.open('https://github.com/piyushh62/Resuvio-AI', '_blank')}
              className="rounded-full px-8 h-14 text-base font-semibold border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
            >
              <Github size={18} className="mr-2" />
              Star on GitHub
            </Button>
          </motion.div>

          {/* Trust badges */}
          <motion.div
            className="flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : {}}
            transition={{ delay: 0.5 }}
          >
            {[
              { icon: Star, text: '4.9/5 Rating' },
              { icon: Sparkles, text: 'AI-Powered' },
              { icon: Github, text: 'Open Source' },
            ].map((badge) => {
              const Icon = badge.icon;
              return (
                <div key={badge.text} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-muted/30 border border-border/30">
                  <Icon size={12} className="text-primary" />
                  <span>{badge.text}</span>
                </div>
              );
            })}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
