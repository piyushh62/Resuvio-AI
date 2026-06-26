import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import {
  FileText,
  BarChart3,
  Target,
  Shield,
  PenTool,
  Layers,
  Sparkles,
  TrendingUp,
  CheckCircle,
} from 'lucide-react';

const features = [
  {
    icon: FileText,
    title: 'AI Resume Builder',
    description: 'Create professional resumes with AI-powered content suggestions. Choose from premium templates and customize every detail.',
    gradient: 'from-violet-500/20 to-blue-500/20',
    iconColor: 'text-violet-500',
    span: '',
    preview: (
      <div className="mt-4 p-4 rounded-xl bg-background/50 border border-border/30">
        <div className="flex gap-3">
          <div className="flex-1 space-y-2">
            <div className="h-2 bg-foreground/10 rounded w-3/4" />
            <div className="h-2 bg-foreground/5 rounded w-full" />
            <div className="h-2 bg-foreground/5 rounded w-5/6" />
            <div className="h-px bg-border/40 my-2" />
            <div className="flex gap-1">
              <span className="px-2 py-0.5 bg-violet-500/10 text-violet-500 text-[9px] rounded-full font-medium">AI Suggested</span>
              <span className="px-2 py-0.5 bg-blue-500/10 text-blue-500 text-[9px] rounded-full font-medium">Optimized</span>
            </div>
          </div>
          <div className="w-px bg-border/30" />
          <div className="w-20 space-y-2">
            <div className="h-8 bg-foreground/5 rounded" />
            <div className="h-8 bg-foreground/5 rounded" />
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: BarChart3,
    title: 'Smart Analysis',
    description: 'Get detailed scoring and actionable feedback to improve your resume instantly.',
    gradient: 'from-blue-500/20 to-cyan-500/20',
    iconColor: 'text-blue-500',
    span: '',
    preview: (
      <div className="mt-4 flex items-center justify-center">
        <div className="relative w-20 h-20">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(var(--border))" strokeWidth="2" />
            <circle cx="18" cy="18" r="15" fill="none" stroke="hsl(217 91% 60%)" strokeWidth="2" strokeLinecap="round" strokeDasharray="94.2" strokeDashoffset="7.5" />
          </svg>
          <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-foreground">92</span>
        </div>
      </div>
    ),
  },
  {
    icon: Target,
    title: 'Job Matching',
    description: 'Match your resume against job descriptions and see how well you fit.',
    gradient: 'from-cyan-500/20 to-emerald-500/20',
    iconColor: 'text-cyan-500',
    span: '',
    preview: (
      <div className="mt-4 space-y-2">
        {[
          { label: 'Skills Match', value: 88 },
          { label: 'Keywords', value: 76 },
          { label: 'Experience', value: 92 },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground w-16 shrink-0">{item.label}</span>
            <div className="flex-1 h-1.5 bg-foreground/5 rounded-full overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-emerald-500" style={{ width: `${item.value}%` }} />
            </div>
            <span className="text-[10px] font-medium text-foreground w-7 text-right">{item.value}%</span>
          </div>
        ))}
      </div>
    ),
  },
  {
    icon: Shield,
    title: 'ATS Optimization',
    description: 'Ensure your resume passes Applicant Tracking Systems with smart formatting and keyword optimization.',
    gradient: 'from-emerald-500/20 to-cyan-500/20',
    iconColor: 'text-emerald-500',
    span: '',
    preview: (
      <div className="mt-4">
        <div className="flex flex-wrap gap-1.5">
          {['React', 'TypeScript', 'Node.js', 'AWS', 'Docker', 'CI/CD'].map((kw) => (
            <span key={kw} className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[9px] rounded-full font-medium flex items-center gap-1">
              <CheckCircle size={8} /> {kw}
            </span>
          ))}
        </div>
      </div>
    ),
  },
  {
    icon: PenTool,
    title: 'Cover Letters',
    description: 'Generate tailored cover letters that complement your resume perfectly.',
    gradient: 'from-amber-500/20 to-rose-500/20',
    iconColor: 'text-amber-500',
    span: '',
    preview: (
      <div className="mt-4 p-3 rounded-lg bg-background/50 border border-border/30">
        <div className="space-y-1.5">
          <div className="h-1.5 bg-foreground/10 rounded w-1/2" />
          <div className="h-1.5 bg-foreground/5 rounded w-full" />
          <div className="h-1.5 bg-foreground/5 rounded w-4/5" />
          <div className="h-1.5 bg-foreground/5 rounded w-full" />
          <div className="flex items-center gap-1 mt-2">
            <Sparkles size={8} className="text-amber-500" />
            <span className="text-[9px] text-amber-500 font-medium">AI Generated</span>
          </div>
        </div>
      </div>
    ),
  },
  {
    icon: Layers,
    title: 'Premium Templates',
    description: 'Choose from professionally designed templates optimized for every industry.',
    gradient: 'from-rose-500/20 to-violet-500/20',
    iconColor: 'text-rose-500',
    span: '',
    preview: (
      <div className="mt-4 flex gap-2 overflow-hidden">
        {['Modern', 'Classic', 'Monochrome', 'ATS Premium'].map((name, i) => (
          <div key={name} className="flex-1 min-w-0 p-2 rounded-lg bg-background/50 border border-border/30 text-center">
            <div className="h-16 rounded bg-gradient-to-br from-foreground/5 to-foreground/10 mb-1.5 flex items-center justify-center">
              <div className="space-y-1 w-8">
                <div className="h-0.5 bg-foreground/20 rounded" />
                <div className="h-0.5 bg-foreground/10 rounded w-3/4" />
                <div className="h-0.5 bg-foreground/10 rounded" />
                <div className="h-0.5 bg-foreground/10 rounded w-5/6" />
              </div>
            </div>
            <span className="text-[9px] text-muted-foreground font-medium">{name}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export function FeaturesGrid() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section id="features" ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/4 left-0 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-[400px] h-[400px] bg-blue-500/5 rounded-full blur-[100px]" />
      </div>

      <div className="container mx-auto px-6">
        <SectionHeading
          badge="Features"
          badgeIcon="✨"
          title="Everything You Need to"
          titleHighlight="Stand Out"
          subtitle="Powerful AI-driven tools designed to help you create, optimize, and land your dream job faster."
        />

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-6xl mx-auto">
          {features.map((feature, i) => {
            const Icon = feature.icon;
            return (
              <motion.div
                key={feature.title}
                className={`group relative p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 cursor-default overflow-hidden ${feature.span}`}
                initial={{ opacity: 0, y: 30 }}
                animate={isInView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
                whileHover={{ y: -4, transition: { duration: 0.3 } }}
              >
                {/* Hover gradient bg */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

                <div className="relative z-10">
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110`}>
                    <Icon size={20} className={feature.iconColor} />
                  </div>

                  <h3 className="text-lg font-semibold text-foreground mb-2 group-hover:text-foreground transition-colors">
                    {feature.title}
                  </h3>

                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.description}
                  </p>

                  {feature.preview}
                </div>

                {/* Bottom gradient line */}
                <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
