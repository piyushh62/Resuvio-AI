import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  CircleDashed,
  Copy,
  Download,
  FileText,
  Sparkles,
  Send,
  CheckCircle2,
  Edit3,
  ArrowRight,
  User,
  Briefcase,
  FileEdit,
  Wand2,
  AlertTriangle
} from "lucide-react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";
import { Loader } from "@/components/ui/loader";
import { Badge } from "@/components/ui/badge";
import apiClient from "@/lib/api";

// Animation variants
const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

// Template options for cover letters
const templates = [
  { id: "professional", name: "Professional", description: "Formal and traditional style" },
  { id: "modern", name: "Modern", description: "Contemporary and bold approach" },
  { id: "creative", name: "Creative", description: "Unique and attention-grabbing" }
];

// Tone options for cover letters
const tones = [
  { id: "professional", label: "Professional", icon: "💼", description: "Balanced and business-appropriate" },
  { id: "friendly", label: "Friendly", icon: "😊", description: "Warm and approachable" },
  { id: "formal", label: "Formal", icon: "🎩", description: "Highly structured and traditional" },
  { id: "enthusiastic", label: "Enthusiastic", icon: "🚀", description: "Energetic and passionate" }
];

export default function CoverLetterGenerator() {
  const location = useLocation();
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [jobDescription, setJobDescription] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [roleName, setRoleName] = useState("");
  const [selectedTemplate, setSelectedTemplate] = useState("professional");
  const [selectedTone, setSelectedTone] = useState("professional");
  const [isGenerating, setIsGenerating] = useState(false);
  const [coverLetter, setCoverLetter] = useState("");
  const [activeTab, setActiveTab] = useState("create");
  const [editorMode, setEditorMode] = useState(false);
  const [generationProgress, setGenerationProgress] = useState(0);
  const [error, setError] = useState(null);
  const [isViewingSaved, setIsViewingSaved] = useState(false);

  // Fetch user's resumes on component mount
  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await apiClient.get('/api/resumes');
        if (response.data && Array.isArray(response.data.resumes)) {
          setResumes(response.data.resumes);
        } else {
          console.warn('Unexpected format for resumes:', response.data);
          setResumes([]);
        }
      } catch (err) {
        console.error("Error fetching resumes:", err);
        toast.error("Failed to load your resumes");
        setResumes([]);
      }
    };

    fetchResumes();
  }, []);

  // Simulated generation progress
  useEffect(() => {
    let interval: NodeJS.Timeout;

    if (isGenerating) {
      interval = setInterval(() => {
        setGenerationProgress(prev => {
          const newProgress = prev + 5;
          if (newProgress >= 100) {
            clearInterval(interval);
            return 100;
          }
          return newProgress;
        });
      }, 100);
    } else {
      setGenerationProgress(0);
    }

    return () => clearInterval(interval);
  }, [isGenerating]);

  // Reset when changing tabs
  useEffect(() => {
    if (activeTab === "view" && !coverLetter) {
      setActiveTab("create");
    }
  }, [activeTab, coverLetter]);

  // Handle initialization from route state (when clicking View/Edit from My Documents)
  useEffect(() => {
    if (location.state?.coverLetter) {
      const cl = location.state.coverLetter;
      setCoverLetter(cl.content);
      setRoleName(cl.jobRole || "");
      setCompanyName(cl.companyName || "");
      setActiveTab("view");
      setIsViewingSaved(true);
      toast.info("Cover letter loaded for viewing/editing");
      
      // Clear state so a refresh doesn't reload it if they want to start fresh
      window.history.replaceState({}, document.title)
    }
  }, [location.state]);

  // Function to generate cover letter using API
  const handleGenerate = async () => {
    if (!selectedResume || !jobDescription) {
      toast.error("Please select a resume and enter a job description");
      return;
    }

    setIsGenerating(true);
    setActiveTab("create");
    setError(null);
    setGenerationProgress(10); // Start progress indicator

    try {
      // Prepare the request payload
      const payload = {
        selectedResume,
        jobDescription,
        companyName,
        roleName,
        selectedTemplate,
        tone: selectedTone
      };

      // Call the backend API
      const response = await apiClient.post('/api/cover-letter/generate', payload);

      if (response.data && response.data.generatedCoverLetter) {
        setCoverLetter(response.data.generatedCoverLetter);
        setActiveTab("view");
        toast.success("Cover letter generated successfully!");
      } else {
        throw new Error("Unexpected API response format");
      }
    } catch (err) {
      console.error("Error generating cover letter:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to generate cover letter";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
      setGenerationProgress(0); // Reset progress
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(coverLetter);
    toast.success("Cover letter copied to clipboard!");
  };

  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([coverLetter], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = `cover-letter-${companyName || 'company'}-${roleName || 'role'}.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    toast.success("Cover letter downloaded!");
  };

  return (
    <motion.div
      className="space-y-8"
      initial="hidden"
      animate="visible"
      variants={staggerContainer}
    >
      <motion.div variants={fadeIn}>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 bg-gradient-to-r from-violet-600 to-blue-600 bg-clip-text text-transparent font-heading tracking-tight">AI Cover Letter Generator</h2>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed">Create customized cover letters for your job applications with AI assistance</p>
          </div>

          <Badge variant="outline" className="px-4 py-1.5 text-sm font-medium border-violet-500/20 bg-violet-500/10 text-violet-600 self-start md:self-center">
            <Sparkles className="h-4 w-4 mr-1.5 text-violet-500" />
            AI Powered
          </Badge>
        </div>
      </motion.div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8 bg-secondary/50 p-1">
          <TabsTrigger value="create" disabled={isViewingSaved} className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md py-2.5">
            <FileEdit className="h-4 w-4 mr-2" />
            Create Letter
          </TabsTrigger>
          <TabsTrigger value="view" disabled={!coverLetter} className="data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm rounded-md py-2.5">
            <FileText className="h-4 w-4 mr-2" />
            View & Edit
          </TabsTrigger>
        </TabsList>

        <TabsContent value="create">
          <motion.div
            className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 md:gap-8"
            variants={fadeIn}
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group">
              <CardHeader className="bg-secondary/30 border-b border-border/40">
                <CardTitle className="flex items-center text-foreground font-heading">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 mr-3">
                    <User className="h-5 w-5" />
                  </div>
                  Your Information
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base mt-1">
                  Select your resume and provide details about the job
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="resume" className="text-foreground font-medium">Select Resume</Label>
                    <Select value={selectedResume} onValueChange={setSelectedResume}>
                      <SelectTrigger id="resume" className="border-border/50 bg-background/50 focus:ring-1 focus:ring-violet-500 h-11">
                        <SelectValue placeholder="Select a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.length > 0 ? (
                          resumes.map(resume => (
                            <SelectItem key={resume.id} value={resume.id}>
                              {resume.originalFilename || resume.title || `Resume ${resume.id.substring(0, 6)}`}
                            </SelectItem>
                          ))
                        ) : (
                          <SelectItem value="no-resumes" disabled>
                            No resumes available
                          </SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="company-name" className="text-foreground font-medium">Company Name</Label>
                      <Input
                        id="company-name"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="e.g., Acme Corp"
                        className="border-border/50 bg-background/50 focus:ring-1 focus:ring-violet-500 h-11"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="role-name" className="text-foreground font-medium">Position/Role</Label>
                      <Input
                        id="role-name"
                        value={roleName}
                        onChange={(e) => setRoleName(e.target.value)}
                        placeholder="e.g., Senior Developer"
                        className="border-border/50 bg-background/50 focus:ring-1 focus:ring-violet-500 h-11"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="job-description" className="text-foreground font-medium">Job Description</Label>
                    <Textarea
                      id="job-description"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                      placeholder="Paste the job description here... The more details you provide, the better the result will be."
                      rows={8}
                      className="resize-none border-border/50 bg-background/50 focus:ring-1 focus:ring-violet-500 p-4"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-sm hover:shadow-md transition-all group">
              <CardHeader className="bg-secondary/30 border-b border-border/40">
                <CardTitle className="flex items-center text-foreground font-heading">
                  <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500 mr-3">
                    <Wand2 className="h-5 w-5" />
                  </div>
                  Generation Options
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base mt-1">
                  Choose your preferences for the cover letter style
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <div className="space-y-3">
                    <Label className="text-foreground font-medium">Select Template Style</Label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      {templates.map(template => (
                        <div
                          key={template.id}
                          onClick={() => setSelectedTemplate(template.id)}
                          className={`
                            p-4 rounded-xl border-2 cursor-pointer transition-all duration-300
                            ${selectedTemplate === template.id
                              ? 'border-violet-500 bg-violet-500/5'
                              : 'border-border/50 bg-background/50 hover:border-violet-500/50 hover:bg-secondary/50'}
                          `}
                        >
                          <div className="flex justify-between items-start mb-2">
                            <span className="font-semibold text-foreground">{template.name}</span>
                            {selectedTemplate === template.id && (
                              <CheckCircle2 className="h-5 w-5 text-violet-500" />
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">{template.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <Label className="text-foreground font-medium">Letter Tone</Label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                      {tones.map(tone => (
                        <div
                          key={tone.id}
                          onClick={() => setSelectedTone(tone.id)}
                          className={`
                            flex flex-col items-center justify-center p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 text-center h-full
                            ${selectedTone === tone.id
                              ? 'border-violet-500 bg-violet-500/5'
                              : 'border-border/50 bg-background/50 hover:border-violet-500/50 hover:bg-secondary/50'}
                          `}
                        >
                          <span className="text-2xl mb-2">{tone.icon}</span>
                          <span className="text-sm font-semibold text-foreground">{tone.label}</span>
                          <span className="text-xs text-muted-foreground mt-1 leading-relaxed hidden sm:block">{tone.description}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-6">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedResume || !jobDescription}
                      className="w-full h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white text-base font-semibold rounded-xl transition-all duration-300 hover:scale-[1.01]"
                    >
                      {isGenerating ? (
                        <>
                          <CircleDashed className="mr-3 h-5 w-5 animate-spin" />
                          AI is generating...
                        </>
                      ) : (
                        <>
                          <Sparkles className="mr-3 h-5 w-5" />
                          Generate AI Cover Letter
                        </>
                      )}
                    </Button>

                    {isGenerating && (
                      <div className="mt-5 bg-secondary/30 p-4 rounded-xl border border-border/50">
                        <div className="flex justify-between text-sm text-foreground font-medium mb-2">
                          <span>AI is writing your cover letter...</span>
                          <span>{generationProgress}%</span>
                        </div>
                        <div className="w-full bg-secondary rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${generationProgress}%` }}
                          ></div>
                        </div>
                      </div>
                    )}

                    {error && (
                      <div className="mt-5 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm flex items-start">
                        <AlertTriangle className="h-5 w-5 mr-3 flex-shrink-0 mt-0.5" />
                        <span className="leading-relaxed">{error}</span>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/30 border-t border-border/40 px-6 py-4">
                <div className="flex items-center text-sm text-muted-foreground">
                  <Briefcase className="h-4 w-4 text-violet-500 mr-2.5" />
                  <span>Personalized to match the job requirements and your qualifications</span>
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>

        <TabsContent value="view">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <Card className="border-border/40 bg-card/50 backdrop-blur-sm shadow-md transition-all overflow-hidden group">
              <CardHeader className={`border-b border-border/40 ${editorMode ? 'bg-secondary/50' : 'bg-gradient-to-r from-violet-500/5 to-blue-500/5'}`}>
                <div className="flex justify-between items-center">
                  <CardTitle className="flex items-center text-foreground font-heading">
                    <FileText className={`h-5 w-5 mr-3 ${editorMode ? 'text-blue-500' : 'text-violet-500'}`} />
                    {editorMode ? 'Edit Your AI Cover Letter' : 'Your AI Generated Cover Letter'}
                  </CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEditorMode(!editorMode)}
                    className={`h-9 px-4 rounded-lg font-medium transition-colors ${editorMode ? 'bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 hover:text-blue-700' : 'bg-violet-500/10 text-violet-600 hover:bg-violet-500/20 hover:text-violet-700'}`}
                  >
                    {editorMode ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" /> Done Editing
                      </>
                    ) : (
                      <>
                        <Edit3 className="h-4 w-4 mr-2" /> Edit Letter
                      </>
                    )}
                  </Button>
                </div>
                <CardDescription className="text-muted-foreground mt-2 text-base">
                  {editorMode
                    ? 'Make any necessary adjustments to your cover letter'
                    : `Cover letter for ${companyName || '[Company Name]'} - ${roleName || '[Position]'}`}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="space-y-6">
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    rows={18}
                    className={`
                      resize-none text-base leading-relaxed p-6 rounded-xl transition-all duration-300
                      ${editorMode
                        ? 'border-blue-500/50 focus:border-blue-500 bg-background focus:ring-1 focus:ring-blue-500 shadow-sm'
                        : 'border-border/40 bg-secondary/30 focus:bg-background'}
                    `}
                    readOnly={!editorMode}
                  />

                  <div className="flex flex-wrap gap-3 sm:gap-4 justify-end">
                    <Button
                      variant="outline"
                      onClick={handleCopy}
                      className="border-border/50 hover:bg-secondary/50 h-11 px-5 rounded-lg font-medium transition-colors"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy to Clipboard
                    </Button>
                    <Button
                      onClick={handleDownload}
                      className="bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white h-11 px-5 rounded-lg font-medium transition-all"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download text
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setActiveTab("create");
                        setIsViewingSaved(false);
                      }}
                      className="border-violet-500/30 bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 h-11 px-5 rounded-lg font-medium transition-colors"
                    >
                      <ArrowRight className="mr-2 h-4 w-4" />
                      Create Another
                    </Button>
                  </div>
                </div>
              </CardContent>
              <CardFooter className="bg-secondary/30 border-t border-border/40 px-6 py-4">
                <div className="text-sm text-muted-foreground italic flex items-center">
                  <Sparkles className="h-4 w-4 mr-2 text-violet-500" />
                  Pro tip: Customize the letter to reflect your unique voice and personality before sending.
                </div>
              </CardFooter>
            </Card>
          </motion.div>
        </TabsContent>
      </Tabs>
    </motion.div>
  );
}
