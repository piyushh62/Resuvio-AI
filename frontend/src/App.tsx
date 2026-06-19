import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import LoginPage from "./pages/LoginPage";
import SignupPage from "./pages/SignupPage";
import { Footer } from "./components/Footer";
import ProtectedRoute from "./components/ProtectedRoute"; // adjust path if different
import Home from "./pages/Home";
import AnalyzeResume from "./pages/AnalyzeResume";
import ResumeBuilder from "./pages/ResumeBuilder";
import JobMatch from "./pages/JobMatch";
import NotFound from "./pages/NotFound";
import { DashboardLayout } from "./components/dashboard/DashboardLayout";
import DashboardHome from "./pages/dashboard/DashboardHome";
import CoverLetterGenerator from "./pages/dashboard/CoverLetterGenerator";
import MyResumes from "./pages/dashboard/MyResumes";
import HelpAndTips from "./pages/dashboard/HelpAndTips";
import PageRefresh from "./components/PageRefresh";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <PageRefresh />
        <Routes>
          {/* Main site routes */}
          <Route
            path="/"
            element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <Home />
                </main>
                <Footer />
              </>
            }
          />
          <Route
            path="/analyze"
            element={<Navigate to="/dashboard/analyze" replace />}
          />
          <Route
            path="/builder"
            element={<Navigate to="/dashboard/builder" replace />}
          />
          <Route
            path="/job-match"
            element={<Navigate to="/dashboard/job-match" replace />}
          />

          {/* Login route */}
          <Route
            path="/login"
            element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <LoginPage />
                </main>
                <Footer />
              </>
            }
          />

          {/* Signup route */}
          <Route
            path="/signup"
            element={
              <>
                <Navbar />
                <main className="flex-grow">
                  <SignupPage />
                </main>
                <Footer />
              </>
            }
          />

          {/* Dashboard routes - Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<DashboardLayout />}>
              <Route index element={<DashboardHome />} />
              <Route path="analyze" element={<AnalyzeResume />} />
              <Route path="builder" element={<ResumeBuilder />} />
              <Route path="job-match" element={<JobMatch />} />
              <Route path="cover-letter" element={<CoverLetterGenerator />} />
              <Route path="my-resumes" element={<MyResumes />} />
              <Route path="help" element={<HelpAndTips />} />
            </Route>
          </Route>

          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
