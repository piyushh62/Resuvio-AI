import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { PageTransition } from "./PageTransition";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import ProtectedRoute from "./ProtectedRoute";
import Home from "../pages/Home";
import AnalyzeResume from "../pages/AnalyzeResume";
import ResumeBuilder from "../pages/ResumeBuilder";
import JobMatch from "../pages/JobMatch";
import NotFound from "../pages/NotFound";
import { DashboardLayout } from "./dashboard/DashboardLayout";
import DashboardHome from "../pages/dashboard/DashboardHome";
import CoverLetterGenerator from "../pages/dashboard/CoverLetterGenerator";
import MyResumes from "../pages/dashboard/MyResumes";
import HelpAndTips from "../pages/dashboard/HelpAndTips";
import ContactPage from "../pages/ContactPage";
import PrivacyPolicy from "../pages/PrivacyPolicy";
import TermsOfService from "../pages/TermsOfService";
import CookiePolicy from "../pages/CookiePolicy";
import RefundPolicy from "../pages/RefundPolicy";
import PricingPage from "../pages/PricingPage";

import BlogPage from "../pages/BlogPage";
import BlogArticle from "../pages/BlogArticle";
import ReferralPage from "../pages/ReferralPage";
import LoginPage from "../pages/LoginPage";
import SignupPage from "../pages/SignupPage";

export const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Main site routes */}
        <Route
          path="/"
          element={
            <PageTransition>
              <Navbar />
              <main className="flex-grow">
                <Home />
              </main>
              <Footer />
            </PageTransition>
          }
        />
        <Route path="/analyze" element={<Navigate to="/dashboard/analyze" replace />} />
        <Route path="/builder" element={<Navigate to="/dashboard/builder" replace />} />
        <Route path="/job-match" element={<Navigate to="/dashboard/job-match" replace />} />

        {/* Login route */}
        <Route
          path="/login"
          element={
            <PageTransition>
              <Navbar />
              <main className="flex-grow">
                <LoginPage />
              </main>
              <Footer />
            </PageTransition>
          }
        />

        {/* Signup route */}
        <Route
          path="/signup"
          element={
            <PageTransition>
              <Navbar />
              <main className="flex-grow">
                <SignupPage />
              </main>
              <Footer />
            </PageTransition>
          }
        />

        {/* Public content pages */}
        {[
          { path: "/contact", element: <ContactPage /> },
          { path: "/privacy", element: <PrivacyPolicy /> },
          { path: "/terms", element: <TermsOfService /> },
          { path: "/cookies", element: <CookiePolicy /> },
          { path: "/refund-policy", element: <RefundPolicy /> },
          { path: "/pricing", element: <PricingPage /> },

          { path: "/blog", element: <BlogPage /> },
          { path: "/blog/:slug", element: <BlogArticle /> },
        ].map(({ path, element }) => (
          <Route
            key={path}
            path={path}
            element={
              <PageTransition>
                <Navbar />
                <main className="flex-grow">{element}</main>
                <Footer />
              </PageTransition>
            }
          />
        ))}

        {/* Dashboard routes - Protected */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<PageTransition><DashboardHome /></PageTransition>} />
            <Route path="analyze" element={<PageTransition><AnalyzeResume /></PageTransition>} />
            <Route path="builder" element={<PageTransition><ResumeBuilder /></PageTransition>} />
            <Route path="job-match" element={<PageTransition><JobMatch /></PageTransition>} />
            <Route path="cover-letter" element={<PageTransition><CoverLetterGenerator /></PageTransition>} />
            <Route path="my-resumes" element={<PageTransition><MyResumes /></PageTransition>} />
            <Route path="help" element={<PageTransition><HelpAndTips /></PageTransition>} />
            <Route path="referral" element={<PageTransition><ReferralPage /></PageTransition>} />
          </Route>
        </Route>

        {/* 404 route */}
        <Route path="*" element={<PageTransition><NotFound /></PageTransition>} />
      </Routes>
    </AnimatePresence>
  );
};
