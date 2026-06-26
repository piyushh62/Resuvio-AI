import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowRight, Sparkles } from 'lucide-react';
import { AnimatedCounter } from './AnimatedCounter';

const trustedCompanies = ['Google', 'Microsoft', 'Amazon', 'Meta', 'Apple', 'Netflix', 'Spotify', 'Uber'];

export function HeroSection({ onGetStarted }: { onGetStarted: () => void }) {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true });

  return (
    <section ref={ref} className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20 pb-16 md:pt-28 md:pb-24">
      {/* Static background — no JS, pure CSS */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-grid-pattern opacity-30" />

        {/* Static gradient blobs — CSS only, no Framer Motion */}
        <div
          className="absolute w-[500px] h-[500px] rounded-full opacity-15 animate-float-slow"
          style={{
            background: 'radial-gradient(circle, hsl(262 83% 58% / 0.25), transparent 70%)',
            top: '5%', left: '15%',
            willChange: 'transform',
          }}
        />
        <div
          className="absolute w-[400px] h-[400px] rounded-full opacity-10 animate-float-delayed"
          style={{
            background: 'radial-gradient(circle, hsl(217 91% 60% / 0.2), transparent 70%)',
            bottom: '10%', right: '10%',
            willChange: 'transform',
          }}
        />
      </div>

      <div className="w-full">
        <motion.div
          className="container mx-auto px-6 text-center max-w-5xl relative z-10"
          initial={{ opacity: 0, y: 20 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        >
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-8">
            <Sparkles size={14} />
            <span>AI-Powered Career Tools</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-[5.5rem] font-bold tracking-tight text-foreground leading-[1.05] mb-6 font-heading">
            Build Resumes That{' '}
            <span className="gradient-text">Land Interviews</span>
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Create ATS-optimized resumes with AI-powered suggestions, match with job descriptions instantly, and land more interviews — all in minutes.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Button
              size="lg"
              onClick={onGetStarted}
              className="group rounded-full px-8 h-14 text-base font-semibold bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-xl hover:shadow-primary/25 text-white transition-all duration-300 hover:scale-[1.02]"
            >
              <Sparkles size={18} className="mr-2" />
              Start Building — It's Free
              <ArrowRight size={18} className="ml-2 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}
              className="rounded-full px-8 h-14 text-base font-semibold border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300"
            >
              See How It Works
            </Button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 max-w-3xl mx-auto mb-16">
            {[
              { target: 10000, suffix: '+', label: 'Resumes Created' },
              { target: 94, suffix: '%', label: 'ATS Pass Rate' },
              { target: 3, suffix: 'x', label: 'More Interviews' },
              { target: 0, suffix: '', label: 'User Rating', display: '4.9' },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold gradient-text mb-1">
                  {stat.display ? <span>{stat.display}</span> : <AnimatedCounter target={stat.target} suffix={stat.suffix} />}
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground font-medium">{stat.label}</div>
              </div>
            ))}
          </div>

          {/* Dashboard Preview — static, no motion wrappers */}
          <div className="relative max-w-4xl mx-auto">
            <div className="rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Browser chrome */}
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border/50 bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-rose-400/60" />
                  <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                  <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
                </div>
                <div className="flex-1 mx-4">
                  <div className="bg-muted/50 rounded-full h-6 max-w-xs mx-auto flex items-center justify-center">
                    <span className="text-[10px] text-muted-foreground">resuvio.ai/builder</span>
                  </div>
                </div>
              </div>

              {/* Mock dashboard */}
              <div className="p-6 sm:p-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                  <div className="sm:col-span-2 bg-background/50 rounded-xl p-4 border border-border/30">
                    <div className="space-y-3">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center text-white font-bold text-sm">JS</div>
                        <div>
                          <div className="h-3 w-32 bg-foreground/10 rounded" />
                          <div className="h-2 w-24 bg-foreground/5 rounded mt-1.5" />
                        </div>
                      </div>
                      <div className="h-2 w-full bg-foreground/5 rounded" />
                      <div className="h-2 w-4/5 bg-foreground/5 rounded" />
                      <div className="h-2 w-3/4 bg-foreground/5 rounded" />
                      <div className="h-px bg-border/30 my-3" />
                      <div className="h-2.5 w-24 bg-foreground/10 rounded" />
                      <div className="h-2 w-full bg-foreground/5 rounded" />
                      <div className="h-2 w-5/6 bg-foreground/5 rounded" />
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-background/50 rounded-xl p-4 border border-border/30 text-center">
                      <div className="text-xs text-muted-foreground mb-2 font-medium">ATS Score</div>
                      <div className="relative w-16 h-16 mx-auto mb-2">
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                          <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2.5" />
                          <circle
                            cx="18" cy="18" r="15" fill="none"
                            stroke="url(#scoreGradient)"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeDasharray="94.2"
                            strokeDashoffset={94.2 * (1 - 0.92)}
                          />
                          <defs>
                            <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                              <stop offset="0%" stopColor="hsl(262 83% 58%)" />
                              <stop offset="100%" stopColor="hsl(192 91% 36%)" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">92</span>
                      </div>
                      <div className="text-[10px] text-emerald-500 font-medium">Excellent</div>
                    </div>

                    <div className="bg-background/50 rounded-xl p-4 border border-border/30">
                      <div className="text-xs text-muted-foreground mb-3 font-medium">Keywords Found</div>
                      <div className="flex flex-wrap gap-1.5">
                        {['React', 'TypeScript', 'Node.js', 'AWS'].map((kw) => (
                          <span key={kw} className="px-2 py-0.5 bg-primary/10 text-primary text-[10px] rounded-full font-medium">{kw}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trusted by — CSS marquee, no JS */}
          <div className="mt-16">
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-4 font-medium">
              Trusted by professionals at
            </p>
            <div className="relative overflow-hidden max-w-2xl mx-auto">
              <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-background to-transparent z-10" />
              <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-background to-transparent z-10" />
              <div className="flex animate-marquee" style={{ willChange: 'transform' }}>
                {[...trustedCompanies, ...trustedCompanies].map((brand, i) => (
                  <span key={`${brand}-${i}`} className="text-sm font-semibold text-muted-foreground/50 whitespace-nowrap mx-6">
                    {brand}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
