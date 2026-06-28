import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { SignInPromptModal } from '@/components/SignInPromptModal';
import { HeroSection } from '@/components/landing/HeroSection';
import { TrustBar } from '@/components/landing/TrustBar';
import { FeaturesGrid } from '@/components/landing/FeaturesGrid';
import { ShowcaseSection } from '@/components/landing/ShowcaseSection';
import { WorkflowSection } from '@/components/landing/WorkflowSection';
import { AIFeaturesSection } from '@/components/landing/AIFeaturesSection';
import { TestimonialsSection } from '@/components/landing/TestimonialsSection';
import { PricingSection } from '@/components/landing/PricingSection';
import { FAQSection } from '@/components/landing/FAQSection';
import { CTASection } from '@/components/landing/CTASection';

const Home = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [showSignInModal, setShowSignInModal] = useState(false);

  const handleGetStarted = () => {
    if (!user) {
      setShowSignInModal(true);
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-background text-foreground overflow-hidden">
      <HeroSection onGetStarted={handleGetStarted} />
      <TrustBar />
      <FeaturesGrid />
      <ShowcaseSection />
      <WorkflowSection />
      <AIFeaturesSection />
      <TestimonialsSection />
      <PricingSection onGetStarted={handleGetStarted} />
      <FAQSection />
      <CTASection onGetStarted={handleGetStarted} />

      <SignInPromptModal isOpen={showSignInModal} onClose={() => setShowSignInModal(false)} />
    </div>
  );
};

export default Home;
