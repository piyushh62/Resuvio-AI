import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { 
  Upload, 
  FileText, 
  BarChart, 
  FileEdit, 
  ArrowUpRight, 
  TrendingUp, 
  Calendar, 
  CheckCircle2, 
  Clock, 
  LineChart
} from "lucide-react";
import { useState, useEffect } from "react";
import apiClient from "@/lib/api";
import { motion } from "framer-motion";

// Define interfaces for our data structures
interface StatData {
  title: string;
  value: string;
  trend?: string;
  trendUp?: boolean;
  description: string;
  icon: JSX.Element;
  color: string;
}

interface ActivityData {
  id: string; // Added an ID for key prop
  title: string;
  description: string;
  date: string;
  icon: JSX.Element;
  type: 'resume_upload' | 'resume_analysis' | 'job_match' | 'resume_generation'; // Example types
}

interface ResumeStrengthData {
  keywords: number;
  experience: number;
  skills: number;
  readability: number;
}

interface UploadedResumeSummary {
  id: string;
  overallScore?: number;
}

interface GeneratedResumeSummary {
  id: string;
}

// Helper to get an icon based on activity type
const getActivityIcon = (type: ActivityData['type']) => {
  switch (type) {
    case 'resume_upload':
      return <Upload className="h-5 w-5 text-primary" />;
    case 'resume_analysis':
      return <FileText className="h-5 w-5 text-primary" />;
    case 'job_match':
      return <BarChart className="h-5 w-5 text-primary" />;
    case 'resume_generation':
      return <FileEdit className="h-5 w-5 text-primary" />;
    default:
      return <TrendingUp className="h-5 w-5 text-primary" />;
  }
};

export default function DashboardHome() {
  const [isLoading, setIsLoading] = useState(true);
  const [statsData, setStatsData] = useState<StatData[]>([]);
  const [recentActivitiesData, setRecentActivitiesData] = useState<ActivityData[]>([]);
  const [resumeStrength, setResumeStrength] = useState<ResumeStrengthData | null>(null);

  // Current date greeting
  const currentDate = new Date();
  const hours = currentDate.getHours();
  const greeting = hours < 12 ? "Good morning" : hours < 18 ? "Good afternoon" : "Good evening";
  
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(currentDate);

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);

      try {
        const [activityRes, uploadedRes, generatedRes] = await Promise.all([
          apiClient.get<ActivityData[]>('/api/activity/recent'),
          apiClient.get<{ resumes: UploadedResumeSummary[] }>('/api/resumes'),
          apiClient.get<{ generatedResumes: GeneratedResumeSummary[] }>('/api/builder/generated')
        ]);

        const uploadedResumes = uploadedRes.data.resumes || [];
        const generatedResumes = generatedRes.data.generatedResumes || [];
        const analyzedScores = uploadedResumes
          .map(resume => resume.overallScore)
          .filter((score): score is number => typeof score === 'number');
        const averageScore = analyzedScores.length
          ? Math.round(analyzedScores.reduce((sum, score) => sum + score, 0) / analyzedScores.length)
          : null;

        setStatsData([
          {
            title: "Resume Score",
            value: averageScore !== null ? String(averageScore) : "N/A",
            description: analyzedScores.length ? "Average analyzed resume score" : "Analyze a resume to see score",
            icon: <LineChart className="h-5 w-5 text-violet-500" />,
            color: "from-violet-500 to-blue-500"
          },
          {
            title: "Uploaded Resumes",
            value: String(uploadedResumes.length),
            description: "Parsed resumes in your account",
            icon: <Upload className="h-5 w-5 text-violet-500" />,
            color: "from-violet-500 to-blue-500"
          },
          {
            title: "Generated Resumes",
            value: String(generatedResumes.length),
            description: "AI-generated resumes saved",
            icon: <FileText className="h-5 w-5 text-violet-500" />,
            color: "from-violet-500 to-blue-500"
          },
          {
            title: "Career Tools",
            value: "4",
            description: "Analysis, builder, matching, letters",
            icon: <FileEdit className="h-5 w-5 text-violet-500" />,
            color: "from-violet-500 to-blue-500"
          },
        ]);

        setResumeStrength(averageScore !== null ? {
          keywords: averageScore,
          experience: averageScore,
          skills: averageScore,
          readability: averageScore
        } : null);

        const fetchedActivities = activityRes.data.map(act => ({
          ...act,
          date: new Date(act.date).toLocaleString(),
          icon: getActivityIcon(act.type as ActivityData['type'])
        }));
        setRecentActivitiesData(fetchedActivities);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        setStatsData([]);
        setRecentActivitiesData([]);
        setResumeStrength(null);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  // Quick actions (considered static configuration, not mock data to be removed)
  const quickActions = [
    { 
      title: "Analyze Resume", 
      description: "Get instant feedback on your current resume", 
      icon: <Upload className="h-5 w-5 text-violet-500" />,
      link: "/dashboard/analyze",
      color: "bg-card/50 backdrop-blur-sm text-foreground border-border/40 hover:border-violet-500/30 hover:bg-violet-500/5"
    },
    { 
      title: "Build New Resume", 
      description: "Create a customized resume with AI assistance", 
      icon: <FileText className="h-5 w-5 text-blue-500" />,
      link: "/dashboard/builder",
      color: "bg-card/50 backdrop-blur-sm text-foreground border-border/40 hover:border-blue-500/30 hover:bg-blue-500/5" 
    },
    { 
      title: "Match to Job", 
      description: "Compare your resume to a specific job posting", 
      icon: <BarChart className="h-5 w-5 text-cyan-500" />,
      link: "/dashboard/job-match",
      color: "bg-card/50 backdrop-blur-sm text-foreground border-border/40 hover:border-cyan-500/30 hover:bg-cyan-500/5" 
    },
    { 
      title: "Generate Cover Letter", 
      description: "Create a tailored cover letter for your application", 
      icon: <FileEdit className="h-5 w-5 text-violet-500" />,
      link: "/dashboard/cover-letter",
      color: "bg-card/50 backdrop-blur-sm text-foreground border-border/40 hover:border-violet-500/30 hover:bg-violet-500/5" 
    },
  ];

  return (
    <div className="space-y-8">
      {/* Header with greeting */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground font-heading tracking-tight">{greeting}</h2>
          <p className="text-muted-foreground mt-1.5 text-lg">{formattedDate}</p>
        </div>
        <Button asChild className="bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white transition-all duration-300">
          <Link to="/dashboard/analyze">
            <Upload className="mr-2 h-4 w-4" /> Upload New Resume
          </Link>
        </Button>
      </div>
      
      {/* Stats Cards */}
      <motion.div 
        variants={{ hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.1 } } }}
        initial="hidden"
        animate="show"
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
      >
        {isLoading ? (
          Array(4).fill(0).map((_, index) => (
            <Card key={index} className="overflow-hidden border-border/40 shadow-sm bg-card/50 backdrop-blur-sm">
              <div className={`h-1 w-full bg-secondary animate-pulse`}></div>
              <CardContent className="pt-6">
                <div className="h-6 bg-secondary rounded w-3/4 mb-2 animate-pulse"></div>
                <div className="h-8 bg-secondary rounded w-1/2 mb-1 animate-pulse"></div>
                <div className="h-4 bg-secondary rounded w-full animate-pulse"></div>
              </CardContent>
            </Card>
          ))
        ) : (
          statsData.map((stat, index) => (
            <motion.div key={index} variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4 } } }}>
              <Card className="overflow-hidden border-border/40 shadow-sm bg-card/60 backdrop-blur-md hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300">
                <div className={`h-1.5 w-full bg-gradient-to-r ${stat.color}`}></div>
                <CardContent className="pt-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                      <div className="flex items-baseline mt-1">
                        <h3 className="text-2xl sm:text-3xl font-bold text-foreground">{stat.value}{stat.title.includes("Score") || stat.title.includes("Rate") ? "%" : ""}</h3>
                        {stat.trend && (
                          <span className={`ml-2 text-sm font-medium ${stat.trendUp ? 'text-emerald-500' : 'text-muted-foreground'}`}>
                            {stat.trend}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{stat.description}</p>
                    </div>
                    <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/50">{stat.icon}</div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))
        )}
      </motion.div>
      
      {/* Main content area - two column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column - Quick actions and Recent activity */}
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="lg:col-span-2 space-y-6"
        >
          {/* Quick Actions */}
          <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-heading">Quick Actions</CardTitle>
              <CardDescription className="text-base">Start your resume optimization process</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                {quickActions.map((action, index) => (
                  <Link 
                    key={index} 
                    to={action.link}
                    className={`group flex items-center p-4 rounded-xl border ${action.color} transition-all duration-300 hover:shadow-md hover:-translate-y-0.5`}
                  >
                    <div className="mr-4 p-2.5 rounded-lg bg-background border border-border/50 shadow-sm">{action.icon}</div>
                    <div>
                      <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{action.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{action.description}</p>
                    </div>
                    <ArrowUpRight className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity text-primary" size={20} />
                  </Link>
                ))}
              </div>
            </CardContent>
          </Card>
          
          {/* Recent Activity */}
          <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-heading">Recent Activity</CardTitle>
              <CardDescription className="text-base">Your resume-related activities</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4 py-4">
                  {Array(3).fill(0).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 animate-pulse">
                      <div className="h-10 w-10 rounded-full bg-secondary"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-secondary rounded w-3/4"></div>
                        <div className="h-3 bg-secondary rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : recentActivitiesData.length > 0 ? (
                <div className="space-y-4 mt-2">
                  {recentActivitiesData.map((activity) => (
                    <div key={activity.id} className="flex items-start p-3 hover:bg-secondary/50 rounded-xl transition-colors border border-transparent hover:border-border/50">
                      <div className="p-2.5 rounded-xl bg-background border border-border/50 shadow-sm mr-4">{activity.icon}</div>
                      <div>
                        <h4 className="font-semibold text-foreground">{activity.title}</h4>
                        <p className="text-sm text-muted-foreground mt-0.5">{activity.description}</p>
                        <p className="text-xs text-muted-foreground mt-1.5 flex items-center">
                          <Clock size={12} className="mr-1" /> {activity.date}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 border-2 border-dashed border-border/50 rounded-xl mt-4">
                  <FileText className="mx-auto h-12 w-12 text-muted-foreground/50" />
                  <h3 className="mt-4 text-base font-medium text-foreground">No Recent Activity</h3>
                  <p className="mt-1.5 text-sm text-muted-foreground">Your latest actions will appear here.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        
        {/* Right column - Resume analytics and upcoming tasks */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="space-y-6"
        >
          {/* Resume Score Visualization */}
          <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-heading">Resume Strength</CardTitle>
              <CardDescription className="text-base">Areas of improvement</CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading || !resumeStrength ? (
                <div className="space-y-4 py-4 animate-pulse">
                  {Array(4).fill(0).map((_, index) => (
                    <div key={index}>
                      <div className="flex justify-between text-sm mb-2">
                        <div className="h-4 bg-secondary rounded w-1/4"></div>
                        <div className="h-4 bg-secondary rounded w-1/6"></div>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2.5"></div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-5 mt-2">
                  {[ 
                    { label: "Keywords", value: resumeStrength.keywords },
                    { label: "Experience", value: resumeStrength.experience },
                    { label: "Skills", value: resumeStrength.skills },
                    { label: "Readability", value: resumeStrength.readability }
                  ].map(item => (
                    <div key={item.label}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="font-medium text-foreground">{item.label}</span>
                        <span className="text-foreground font-semibold">{item.value}%</span>
                      </div>
                      <div className="w-full bg-secondary/80 rounded-full h-2.5 overflow-hidden">
                        <div className="bg-gradient-to-r from-violet-500 to-blue-500 h-2.5 rounded-full transition-all duration-1000 ease-out" style={{ width: `${item.value}%` }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
            {!isLoading && resumeStrength && (
              <CardFooter className="border-t border-border/40 bg-secondary/20 mt-4">
                <Button asChild variant="ghost" className="w-full text-violet-500 hover:text-violet-600 hover:bg-violet-500/10 font-medium">
                  <Link to="/dashboard/analyze">View Detailed Analysis</Link>
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {/* Upcoming Tasks */}
          <Card className="border border-border/40 shadow-sm bg-card/60 backdrop-blur-md">
            <CardHeader className="pb-2">
              <CardTitle className="text-xl sm:text-2xl font-bold text-foreground font-heading">Upcoming Tasks</CardTitle>
              <CardDescription className="text-base">Items on your to-do list</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-10 border-2 border-dashed border-border/50 rounded-xl mt-4">
                <Calendar className="mx-auto h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-base font-medium text-foreground">Tasks are not available yet</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">Use Quick Actions to continue your resume workflow.</p>
              </div>
            </CardContent>
          </Card>
          
          {/* Tip of the day */}
          <Card className="border border-border/40 shadow-sm bg-gradient-to-br from-violet-500/5 to-blue-500/5">
            <CardContent className="p-5">
              <div className="flex">
                <div className="p-2.5 rounded-xl bg-background border border-border/50 text-violet-500 mr-4 flex-shrink-0 shadow-sm">
                  <TrendingUp size={20} />
                </div>
                <div>
                  <h4 className="font-semibold text-foreground">Resume Tip</h4>
                  <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                    Including quantifiable achievements can increase your resume's effectiveness by up to 40%.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>


    </div>
  );
}
