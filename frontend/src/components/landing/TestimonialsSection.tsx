import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { SectionHeading } from './SectionHeading';
import { Star } from 'lucide-react';

const testimonials = [
  {
    quote: "I landed 3 interviews in my first week after optimizing my resume with Resuvio-AI. The keyword suggestions were spot-on for the tech industry.",
    name: "Sarah Johnson",
    role: "Software Engineer at Google",
    rating: 5,
    gradient: 'from-violet-500/20 to-blue-500/20',
  },
  {
    quote: "The AI analysis identified gaps in my resume that I hadn't noticed. After implementing the suggestions, I received callbacks from companies that had previously rejected me.",
    name: "Michael Chen",
    role: "Marketing Director at Meta",
    rating: 5,
    gradient: 'from-blue-500/20 to-cyan-500/20',
  },
  {
    quote: "As a recent graduate with limited experience, I was struggling to get noticed. This tool helped me highlight my skills in a way that caught recruiters' attention.",
    name: "Priya Patel",
    role: "Business Analyst at Amazon",
    rating: 5,
    gradient: 'from-cyan-500/20 to-emerald-500/20',
  },
  {
    quote: "The cover letter generator saved me hours of work. Each letter was perfectly tailored to the job description and my experience. Absolutely worth it!",
    name: "James Wilson",
    role: "Product Manager at Stripe",
    rating: 5,
    gradient: 'from-emerald-500/20 to-violet-500/20',
  },
  {
    quote: "I was skeptical about AI resume tools but Resuvio-AI completely changed my mind. My ATS score went from 45% to 92% and I finally started getting responses.",
    name: "Emily Davis",
    role: "Data Scientist at Netflix",
    rating: 5,
    gradient: 'from-amber-500/20 to-rose-500/20',
  },
  {
    quote: "The best part is how intuitive it is. I went from uploading my old resume to having a polished, professional document in under 15 minutes. Game changer!",
    name: "Alex Rodriguez",
    role: "UX Designer at Apple",
    rating: 5,
    gradient: 'from-rose-500/20 to-violet-500/20',
  },
];

export function TestimonialsSection() {
  const ref = useRef<HTMLElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-100px' });

  return (
    <section ref={ref} className="relative py-8 md:py-10 overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute top-1/2 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -translate-y-1/2" />
      </div>

      <div className="container mx-auto px-6">
        <SectionHeading
          badge="Testimonials"
          badgeIcon="💬"
          title="Loved by"
          titleHighlight="Professionals"
          subtitle="Join thousands of job seekers who've transformed their careers with Resuvio-AI."
        />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-6xl mx-auto">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              className="group relative p-6 rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm hover:border-primary/30 transition-all duration-500 cursor-default overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              animate={isInView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.22, 1, 0.36, 1] }}
              whileHover={{ y: -4, transition: { duration: 0.3 } }}
            >
              {/* Hover gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${t.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />

              {/* Quote mark */}
              <div className="absolute -top-2 -right-1 text-6xl font-serif text-primary/5 group-hover:text-primary/10 transition-colors duration-500 select-none">"</div>

              <div className="relative z-10">
                {/* Stars */}
                <div className="flex items-center gap-1 mb-4">
                  {[...Array(t.rating)].map((_, j) => (
                    <Star key={j} size={14} fill="currentColor" className="text-amber-400" />
                  ))}
                </div>

                {/* Quote */}
                <p className="text-sm text-foreground/80 mb-6 leading-relaxed">
                  "{t.quote}"
                </p>

                {/* Author */}
                <div className="flex items-center gap-3 pt-4 border-t border-border/30">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/30 to-primary/10 flex items-center justify-center text-foreground font-bold text-sm">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.role}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
