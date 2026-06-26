import { useRef, useState, useEffect } from 'react';
import { motion, useInView } from 'framer-motion';
import { Sparkles, Bot, User, Send } from 'lucide-react';

const chatMessages = [
  { role: 'user', text: 'Can you improve my work experience bullet point about project management?' },
  { role: 'ai', text: 'Of course! Here\'s an optimized version:\n\n"Led cross-functional team of 12 engineers across 3 product initiatives, delivering all milestones 15% ahead of schedule while reducing sprint cycle time by 20% through Agile methodology improvements."\n\nKey improvements:\n• Added team size and scope quantification\n• Included measurable outcomes (15%, 20%)\n• Specified methodology (Agile)\n• Used strong action verb (Led)' },
];

export function AIFeaturesSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });
  const [visibleChars, setVisibleChars] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const aiMessage = chatMessages[1].text;

  useEffect(() => {
    if (!isInView) return;
    const timer = setTimeout(() => setShowChat(true), 500);
    return () => clearTimeout(timer);
  }, [isInView]);

  useEffect(() => {
    if (!showChat) return;
    if (visibleChars < aiMessage.length) {
      const timer = setTimeout(() => setVisibleChars((c) => Math.min(c + 3, aiMessage.length)), 15);
      return () => clearTimeout(timer);
    }
  }, [showChat, visibleChars, aiMessage.length]);

  return (
    <section ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full opacity-5" style={{ background: 'radial-gradient(circle, hsl(262 83% 58%), transparent 70%)' }} />
      </div>

      <div className="container mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          {/* Left: Description */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6">
              <Sparkles size={14} />
              <span>AI-Powered</span>
            </div>

            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-6 font-heading">
              Your Personal{' '}
              <span className="gradient-text">AI Career Assistant</span>
            </h2>

            <p className="text-lg text-muted-foreground leading-relaxed mb-8">
              Powered by Google Gemini, our AI understands your career goals and transforms your resume into a powerful marketing document that gets noticed.
            </p>

            <div className="space-y-4">
              {[
                'Rewrite bullet points with quantified achievements',
                'Suggest missing keywords for target roles',
                'Generate tailored cover letters instantly',
                'Optimize formatting for ATS compatibility',
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                    <Sparkles size={10} className="text-primary" />
                  </div>
                  <span className="text-sm text-foreground">{item}</span>
                </div>
              ))}
            </div>

            <div className="inline-flex items-center gap-2 mt-8 px-4 py-2 rounded-full bg-muted/50 border border-border/50 text-xs text-muted-foreground">
              <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center">
                <Sparkles size={8} className="text-white" />
              </div>
              Powered by Google Gemini AI
            </div>
          </motion.div>

          {/* Right: Chat interface */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={isInView ? { opacity: 1, x: 0 } : {}}
            transition={{ duration: 0.5, delay: 0.15 }}
          >
            <div className="rounded-2xl border border-border/50 bg-card shadow-2xl shadow-primary/5 overflow-hidden">
              {/* Header */}
              <div className="flex items-center gap-3 px-5 py-3 border-b border-border/50 bg-muted/30">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                  <Bot size={16} className="text-white" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">AI Assistant</div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    <span className="text-[10px] text-emerald-500 font-medium">Online</span>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="p-5 space-y-4 min-h-[320px] max-h-[400px] overflow-y-auto">
                {showChat && (
                  <>
                    <div className="flex justify-end">
                      <div className="flex items-start gap-2 max-w-[80%]">
                        <div className="px-4 py-2.5 rounded-2xl rounded-tr-md bg-primary text-primary-foreground text-sm">
                          {chatMessages[0].text}
                        </div>
                        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center shrink-0">
                          <User size={14} className="text-muted-foreground" />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-start">
                      <div className="flex items-start gap-2 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center shrink-0">
                          <Bot size={14} className="text-white" />
                        </div>
                        <div className="px-4 py-2.5 rounded-2xl rounded-tl-md bg-muted/50 border border-border/30 text-sm text-foreground whitespace-pre-line leading-relaxed">
                          {aiMessage.slice(0, visibleChars)}
                          {visibleChars < aiMessage.length && (
                            <span className="inline-block w-0.5 h-4 bg-primary ml-0.5 animate-pulse" />
                          )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Input */}
              <div className="px-4 py-3 border-t border-border/50 bg-muted/20">
                <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-background border border-border/50">
                  <span className="text-sm text-muted-foreground flex-1">Ask AI to improve your resume...</span>
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                    <Send size={14} className="text-white" />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
