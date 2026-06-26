import { Link } from 'react-router-dom';
import { ArrowUpRight, Github, Twitter, Linkedin, Heart } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="relative border-t border-border/40 bg-background">
      {/* Gradient top line */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent" />

      <div className="container mx-auto px-6 py-14 sm:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-10 md:gap-12 text-center sm:text-left">
          {/* Brand Column */}
          <div className="col-span-1 sm:col-span-2 md:col-span-1">
            <div className="mb-4 flex items-center justify-center sm:justify-start gap-2">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center">
                <span className="text-white font-bold text-xs">R</span>
              </div>
              <span className="font-bold text-lg text-foreground font-heading">Resuvio</span>
            </div>
            <p className="text-sm text-muted-foreground mb-5 max-w-xs mx-auto sm:mx-0 leading-relaxed">
              AI-powered career tools to help you build better resumes, land more interviews, and accelerate your career.
            </p>
            <div className="flex justify-center sm:justify-start space-x-2">
              {[
                { href: 'https://github.com/piyushh62/Resuvio-AI', icon: Github, label: 'GitHub' },
                { href: 'https://twitter.com', icon: Twitter, label: 'Twitter' },
                { href: 'https://linkedin.com', icon: Linkedin, label: 'LinkedIn' },
              ].map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.label}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-9 h-9 rounded-full border border-border/50 bg-card/50 flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 hover:bg-primary/5 transition-all duration-300 hover:scale-105"
                    aria-label={social.label}
                  >
                    <Icon size={15} />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Product Links */}
          <div>
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4">
              Product
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/analyze', label: 'Resume Analysis' },
                { to: '/builder', label: 'Resume Builder' },
                { to: '/job-match', label: 'Job Matching' },
                { to: '/pricing', label: 'Pricing' },

                { to: '/blog', label: 'Blog' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center group"
                  >
                    <span>{link.label}</span>
                    <ArrowUpRight
                      size={11}
                      className="ml-1 opacity-0 -translate-y-0.5 translate-x-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-1 transition-all duration-200"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4">
              Company
            </h3>
            <ul className="space-y-3">
              <li>
                <Link
                  to="/contact"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center group"
                >
                  <span>Contact</span>
                  <ArrowUpRight size={11} className="ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@aicareerforge.com"
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors inline-flex items-center group"
                >
                  <span>support@aicareerforge.com</span>
                  <ArrowUpRight size={11} className="ml-1 opacity-0 group-hover:opacity-100 transition-all duration-200" />
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h3 className="text-xs uppercase text-muted-foreground font-semibold tracking-wider mb-4">
              Legal
            </h3>
            <ul className="space-y-3">
              {[
                { to: '/privacy', label: 'Privacy Policy' },
                { to: '/terms', label: 'Terms of Service' },
                { to: '/cookies', label: 'Cookie Policy' },
                { to: '/refund-policy', label: 'Refund Policy' },
              ].map((link) => (
                <li key={link.to}>
                  <Link
                    to={link.to}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/40 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-muted-foreground text-xs">
          <p>&copy; {currentYear} Resuvio-AI. All rights reserved.</p>
          <p className="flex items-center gap-1 mt-3 md:mt-0">
            Built with <Heart size={11} className="text-rose-400 fill-rose-400" /> using AI
          </p>
        </div>
      </div>
    </footer>
  );
}
