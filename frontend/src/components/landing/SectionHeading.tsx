import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

interface SectionHeadingProps {
  badge?: string;
  badgeIcon?: string;
  title: string;
  titleHighlight?: string;
  subtitle?: string;
  className?: string;
  align?: 'center' | 'left';
}

export function SectionHeading({
  badge,
  badgeIcon,
  title,
  titleHighlight,
  subtitle,
  className = '',
  align = 'center',
}: SectionHeadingProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-80px' });

  return (
    <motion.div
      ref={ref}
      className={`max-w-3xl ${align === 'center' ? 'mx-auto text-center' : ''} mb-16 ${className}`}
      initial={{ opacity: 0, y: 30 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {badge && (
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/5 text-sm font-medium text-primary mb-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : {}}
          transition={{ duration: 0.4, delay: 0.1 }}
        >
          {badgeIcon && <span>{badgeIcon}</span>}
          <span>{badge}</span>
        </motion.div>
      )}

      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-foreground mb-4 font-heading">
        {title}
        {titleHighlight && (
          <span className="gradient-text"> {titleHighlight}</span>
        )}
      </h2>

      {subtitle && (
        <motion.p
          className="text-base sm:text-lg text-muted-foreground leading-relaxed max-w-2xl mx-auto"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : {}}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {subtitle}
        </motion.p>
      )}
    </motion.div>
  );
}
