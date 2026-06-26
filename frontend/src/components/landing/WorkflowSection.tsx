import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Upload, BarChart3, Wand2, Download } from 'lucide-react';

const steps = [
  {
    icon: Upload,
    title: 'Upload Your Resume',
    description: 'Upload your existing resume in PDF or DOCX format, or start fresh with our AI builder.',
    color: 'from-violet-500 to-violet-600',
    bgColor: 'bg-violet-500/10',
    iconColor: 'text-violet-500',
  },
  {
    icon: BarChart3,
    title: 'Get AI Analysis',
    description: 'Our AI analyzes your resume against ATS systems and provides a detailed score with actionable improvements.',
    color: 'from-blue-500 to-blue-600',
    bgColor: 'bg-blue-500/10',
    iconColor: 'text-blue-500',
  },
  {
    icon: Wand2,
    title: 'Optimize & Enhance',
    description: 'Apply AI suggestions to strengthen bullet points, add missing keywords, and improve formatting.',
    color: 'from-cyan-500 to-cyan-600',
    bgColor: 'bg-cyan-500/10',
    iconColor: 'text-cyan-500',
  },
  {
    icon: Download,
    title: 'Download & Apply',
    description: 'Export your polished resume as PDF and start applying to jobs with confidence.',
    color: 'from-emerald-500 to-emerald-600',
    bgColor: 'bg-emerald-500/10',
    iconColor: 'text-emerald-500',
  },
];

export function WorkflowSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10 bg-gradient-to-b from-background via-muted/20 to-background" />

      <div className="container mx-auto px-6">
        <SectionHeading
          badge="How It Works"
          badgeIcon="⚡"
          title="Four Steps to Your"
          titleHighlight="Dream Job"
          subtitle="A simple, streamlined process that takes you from upload to interview-ready in minutes."
        />

        <div className="max-w-4xl mx-auto relative">
          {/* Connecting line */}
          <div className="absolute left-8 md:left-1/2 top-0 bottom-0 w-px hidden sm:block">
            <motion.div
              className="w-full h-full"
              style={{ background: 'linear-gradient(to bottom, hsl(var(--violet)), hsl(var(--blue)), hsl(var(--cyan)), hsl(var(--emerald)))' }}
              initial={{ scaleY: 0, transformOrigin: 'top' }}
              animate={isInView ? { scaleY: 1 } : {}}
              transition={{ duration: 1.5, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            />
          </div>

          {/* Steps */}
          <div className="space-y-12 md:space-y-16">
            {steps.map((step, i) => {
              const Icon = step.icon;
              const isEven = i % 2 === 0;

              return (
                <motion.div
                  key={step.title}
                  className={`relative flex flex-col sm:flex-row items-start sm:items-center gap-6 ${isEven ? 'md:flex-row' : 'md:flex-row-reverse'}`}
                  initial={{ opacity: 0, y: 30, x: isEven ? -20 : 20 }}
                  animate={isInView ? { opacity: 1, y: 0, x: 0 } : {}}
                  transition={{ duration: 0.6, delay: 0.2 + i * 0.15, ease: [0.22, 1, 0.36, 1] }}
                >
                  {/* Step content */}
                  <div className={`flex-1 ${isEven ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                    <div className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-widest mb-2 ${step.iconColor}`}>
                      Step {i + 1}
                    </div>
                    <h3 className="text-xl font-bold text-foreground mb-2 font-heading">{step.title}</h3>
                    <p className="text-sm text-muted-foreground leading-relaxed max-w-sm">{step.description}</p>
                  </div>

                  {/* Center icon */}
                  <div className="relative z-10 shrink-0 order-first sm:order-none">
                    <motion.div
                      className={`w-16 h-16 rounded-2xl ${step.bgColor} flex items-center justify-center border border-border/50 bg-card shadow-lg`}
                      whileHover={{ scale: 1.1, rotate: 5 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                    >
                      <Icon size={24} className={step.iconColor} />
                    </motion.div>
                  </div>

                  {/* Spacer for alternating layout */}
                  <div className="flex-1 hidden md:block" />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
