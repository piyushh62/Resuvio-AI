import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { AnimatedCounter } from './AnimatedCounter';
import { Users, TrendingUp, Download, Star } from 'lucide-react';

const stats = [
  { icon: Users, target: 10000, suffix: '+', label: 'Active Users' },
  { icon: TrendingUp, target: 94, suffix: '%', label: 'ATS Pass Rate' },
  { icon: Download, target: 50000, suffix: '+', label: 'Resumes Downloaded' },
  { icon: Star, target: 49, suffix: '', label: 'User Rating', display: '4.9' },
];

const logos = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Uber', 'Stripe', 'Figma', 'GitHub', 'Notion'];

export function TrustBar() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-50px' });

  return (
    <section ref={ref} className="relative py-16 border-y border-border/40">
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-6 relative z-10">
        {/* Stats row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-primary/10 text-primary mb-3">
                  <Icon size={20} />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-foreground mb-1">
                  {stat.display ? (
                    <span>{stat.display}</span>
                  ) : (
                    <AnimatedCounter target={stat.target} suffix={stat.suffix} />
                  )}
                </div>
                <div className="text-sm text-muted-foreground font-medium">{stat.label}</div>
              </motion.div>
            );
          })}
        </div>

        {/* Logo marquee */}
        <div className="relative overflow-hidden">
          <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-background to-transparent z-10" />
          <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-background to-transparent z-10" />

          <div className="flex animate-marquee">
            {[...logos, ...logos].map((brand, i) => (
              <div
                key={`${brand}-${i}`}
                className="flex items-center justify-center mx-8 whitespace-nowrap"
              >
                <span className="text-lg font-semibold text-muted-foreground/30 hover:text-muted-foreground/50 transition-colors duration-300">
                  {brand}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
