import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Menu, X, ArrowRight, Sun, Moon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { SignInPromptModal } from './SignInPromptModal';
import { motion, AnimatePresence } from 'framer-motion';

export function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const { user, logout, isLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    setIsMenuOpen(false);
    navigate('/');
  };

  const handleGetStartedClick = () => {
    navigate('/login');
  };

  const renderAuthButtons = () => {
    if (isLoading) {
      return <Button disabled variant="ghost" className="text-muted-foreground">Loading...</Button>;
    }
    if (user) {
      return (
        <div className="flex items-center space-x-3">
          <Button
            variant="outline"
            onClick={() => navigate('/dashboard')}
            className="rounded-full border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all duration-300 text-sm"
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-primary hover:bg-transparent text-sm"
          >
            Logout
          </Button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            onClick={() => navigate('/login')}
            className="text-muted-foreground hover:text-foreground text-sm font-medium"
          >
            Sign In
          </Button>
          <Button
            onClick={handleGetStartedClick}
            className="rounded-full bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/20 text-white transition-all duration-300 text-sm font-medium px-5"
          >
            <span className="mr-1.5">Get Started</span>
            <ArrowRight size={14} />
          </Button>
        </div>
      );
    }
  };

  const renderMobileAuthButtons = () => {
    if (isLoading) {
      return <Button className="w-full rounded-full" disabled>Loading...</Button>;
    }
    if (user) {
      return (
        <>
          <Button
            variant="outline"
            className="w-full rounded-full border-border/60 hover:border-primary/40"
            onClick={() => {
              setIsMenuOpen(false);
              navigate('/dashboard');
            }}
          >
            Dashboard
          </Button>
          <Button
            variant="ghost"
            className="w-full text-muted-foreground"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </>
      );
    } else {
      return (
        <>
          <Button
            variant="outline"
            className="w-full rounded-full border-border/60"
            onClick={() => {
              setIsMenuOpen(false);
              navigate('/login');
            }}
          >
            Sign In
          </Button>
          <Button
            className="w-full rounded-full bg-gradient-to-r from-violet-600 to-blue-600 text-white"
            onClick={() => {
              setIsMenuOpen(false);
              handleGetStartedClick();
            }}
          >
            <span className="mr-1.5">Get Started</span>
            <ArrowRight size={14} />
          </Button>
        </>
      );
    }
  };

  const isActive = (path: string) => {
    return location.pathname === path
      ? "text-foreground font-medium"
      : "text-muted-foreground hover:text-foreground";
  };

  const navLinks = [
    { to: '/', text: 'Home' },
    { to: '/pricing', text: 'Pricing' },

    { to: '/blog', text: 'Blog' },
  ];

  const isHomePage = location.pathname === '/';

  return (
    <>
      <motion.nav
        className={`relative py-3 px-6 sticky top-0 z-40 transition-all duration-500 ${
          isScrolled || !isHomePage
            ? 'bg-background/70 backdrop-blur-xl border-b border-border/40 shadow-sm'
            : 'bg-transparent'
        }`}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="container mx-auto flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <motion.div
              className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-500 flex items-center justify-center"
              whileHover={{ scale: 1.05, rotate: 3 }}
              transition={{ type: 'spring', stiffness: 400 }}
            >
              <span className="text-white font-bold text-sm">R</span>
            </motion.div>
            <span className="font-bold text-lg text-foreground group-hover:text-primary transition-colors duration-300 font-heading">
              Resuvio
            </span>
          </Link>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all w-9 h-9"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
              </motion.div>
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-foreground hover:bg-muted/50 w-9 h-9"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </Button>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map(link => (
              <Link
                key={link.to}
                to={link.to}
                className={`relative ${isActive(link.to)} transition-colors text-sm font-medium px-4 py-2 rounded-lg hover:bg-muted/50`}
              >
                {link.text}
                {location.pathname === link.to && (
                  <motion.div
                    className="absolute bottom-0 left-2 right-2 h-0.5 rounded-full bg-gradient-to-r from-violet-500 to-blue-500"
                    layoutId="navbar-indicator"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </Link>
            ))}
          </div>

          <div className="hidden md:flex items-center space-x-3">
            {/* Theme toggle */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className="rounded-full text-muted-foreground hover:text-foreground hover:bg-muted/50 transition-all w-9 h-9"
            >
              <motion.div
                key={theme}
                initial={{ rotate: -90, opacity: 0 }}
                animate={{ rotate: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
              </motion.div>
            </Button>

            {renderAuthButtons()}
          </div>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden fixed inset-0 bg-black/50 z-40"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMenuOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Mobile Menu Drawer */}
        <AnimatePresence>
          {isMenuOpen && (
            <motion.div
              className="md:hidden fixed top-0 right-0 h-full w-4/5 max-w-sm bg-background z-50 border-l border-border/50"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            >
              <div className="p-6 flex flex-col h-full">
                <div className="flex justify-between items-center mb-10">
                  <span className="font-bold text-lg text-foreground font-heading">Menu</span>
                  <Button variant="ghost" size="icon" className="text-muted-foreground hover:bg-muted/50 w-9 h-9" onClick={() => setIsMenuOpen(false)}>
                    <X size={22} />
                  </Button>
                </div>
                <nav className="flex flex-col space-y-1">
                  {navLinks.map((link) => (
                    <Link
                      key={link.to}
                      to={link.to}
                      onClick={() => setIsMenuOpen(false)}
                      className={`${isActive(link.to)} p-3 rounded-lg transition-colors duration-200 hover:bg-muted/50 text-base font-medium`}
                    >
                      {link.text}
                    </Link>
                  ))}
                </nav>
                <div className="mt-auto pt-6 border-t border-border/50 flex flex-col space-y-3">
                  {renderMobileAuthButtons()}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
      <SignInPromptModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </>
  );
}
