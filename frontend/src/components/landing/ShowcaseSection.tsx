import { useRef, useState, useEffect } from 'react';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { ArrowRight, Check, Sparkles } from 'lucide-react';

const beforeContent = [
  'Worked on software projects',
  'Managed team members',
  'Used programming languages',
  'Helped with customer issues',
  'Did testing and deployment',
];

const afterContent = [
  'Led development of 3 microservices handling 10K+ RPM, reducing latency by 40%',
  'Managed cross-functional team of 8 engineers, delivering projects 2 weeks ahead of schedule',
  'Built full-stack applications using React, TypeScript, Node.js, and PostgreSQL',
  'Resolved 95% of Tier-2 customer escalations within SLA, improving CSAT score by 18%',
  'Implemented CI/CD pipeline with 98% test coverage, reducing deployment time by 60%',
];

export function ShowcaseSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [showAfter, setShowAfter] = useState(false);
  const [typingIdx, setTypingIdx] = useState(0);
  const [typingChar, setTypingChar] = useState(0);

  useEffect(() => {
    if (!isInView || !showAfter) return;
    const currentLine = afterContent[typingIdx];
    if (!currentLine) return;

    if (typingChar < currentLine.length) {
      const timer = setTimeout(() => setTypingChar((c) => c + 1), 12);
      return () => clearTimeout(timer);
    } else if (typingIdx < afterContent.length - 1) {
      const timer = setTimeout(() => {
        setTypingIdx((i) => i + 1);
        setTypingChar(0);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isInView, showAfter, typingIdx, typingChar]);

  useEffect(() => {
    if (isInView) {
      const timer = setTimeout(() => setShowAfter(true), 2000);
      return () => clearTimeout(timer);
    }
  }, [isInView]);

  return (
    <section ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-violet-500/5 rounded-full blur-[150px]" />
      </div>

      <div className="container mx-auto px-6">
        <SectionHeading
          badge="See It In Action"
          badgeIcon="🚀"
          title="From Generic to"
          titleHighlight="Outstanding"
          subtitle="Watch how AI transforms vague bullet points into powerful, quantified achievements that catch recruiter attention."
        />

        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={isInView ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.7, delay: 0.2 }}
        >
          {/* Browser window */}
          <div className="rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm shadow-2xl shadow-primary/5 overflow-hidden">
            {/* Browser chrome */}
            <div className="flex items-center justify-between px-4 py-3 border-b border-border/50 bg-muted/30">
              <div className="flex gap-1.5">
                <div className="w-3 h-3 rounded-full bg-rose-400/60" />
                <div className="w-3 h-3 rounded-full bg-amber-400/60" />
                <div className="w-3 h-3 rounded-full bg-emerald-400/60" />
              </div>
              <div className="flex items-center gap-2 px-4 py-1 rounded-full bg-muted/50 text-[10px] text-muted-foreground">
                <Sparkles size={10} className="text-primary" />
                AI Resume Optimizer
              </div>
              <div className="w-12" />
            </div>

            {/* Content */}
            <div className="p-6 sm:p-8">
              {/* Toggle */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => { setShowAfter(false); setTypingIdx(0); setTypingChar(0); }}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${!showAfter ? 'bg-primary text-primary-foreground shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Before
                </button>
                <ArrowRight size={16} className="text-muted-foreground" />
                <button
                  onClick={() => setShowAfter(true)}
                  className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${showAfter ? 'bg-gradient-to-r from-violet-600 to-blue-600 text-white shadow-lg' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  After AI ✨
                </button>
              </div>

              {/* Content area */}
              <div className="min-h-[260px]">
                <AnimatePresence mode="wait">
                  {!showAfter ? (
                    <motion.div
                      key="before"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4">Work Experience</h3>
                      {beforeContent.map((line, i) => (
                        <motion.div
                          key={i}
                          className="flex items-start gap-3 p-3 rounded-xl bg-background/50 border border-border/30"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: i * 0.1 }}
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-muted-foreground/30 mt-2 shrink-0" />
                          <span className="text-sm text-muted-foreground">{line}</span>
                        </motion.div>
                      ))}
                    </motion.div>
                  ) : (
                    <motion.div
                      key="after"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-3"
                    >
                      <h3 className="text-sm font-semibold text-primary uppercase tracking-wider mb-4 flex items-center gap-2">
                        <Sparkles size={14} />
                        AI-Optimized Experience
                      </h3>
                      {afterContent.map((line, i) => {
                        const isTyping = i === typingIdx;
                        const isDone = i < typingIdx;
                        const isHidden = i > typingIdx;

                        return (
                          <motion.div
                            key={i}
                            className={`flex items-start gap-3 p-3 rounded-xl border transition-all duration-300 ${isDone || isTyping ? 'bg-primary/5 border-primary/20' : 'bg-background/50 border-border/30 opacity-30'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: isHidden ? 0.3 : 1, y: 0 }}
                            transition={{ delay: i * 0.05 }}
                          >
                            {isDone ? (
                              <Check size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-primary/40 mt-2 shrink-0" />
                            )}
                            <span className="text-sm text-foreground leading-relaxed">
                              {isTyping ? line.slice(0, typingChar) : isDone ? line : line}
                              {isTyping && <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />}
                            </span>
                          </motion.div>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>

          {/* Glow */}
          <div className="absolute -inset-8 bg-gradient-to-r from-violet-500/5 via-blue-500/5 to-cyan-500/5 blur-3xl -z-10 rounded-3xl" />
        </motion.div>
      </div>
    </section>
  );
}
