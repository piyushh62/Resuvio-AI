
import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-background relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-grid-pattern opacity-10" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 rounded-full blur-3xl -z-10" />
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center max-w-md relative z-10"
      >
        <h1 className="text-6xl sm:text-7xl md:text-9xl font-bold tracking-tight mb-2 sm:mb-4 gradient-text font-heading">
          404
        </h1>
        <p className="text-xl sm:text-2xl text-foreground font-semibold mb-4 sm:mb-6">
          Oops! This page is missing from our resume.
        </p>
        <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-8 leading-relaxed">
          The page you are looking for might have been removed, had its name changed, 
          or is temporarily unavailable. Let's get you back on track.
        </p>
        <Button asChild size="lg" className="rounded-full bg-gradient-to-r from-violet-600 via-blue-600 to-cyan-500 hover:shadow-lg hover:shadow-primary/25 text-white transition-all duration-300 hover:scale-[1.02]">
          <Link to="/">Return to Homepage</Link>
        </Button>
      </motion.div>
    </div>
  );
};

export default NotFound;
