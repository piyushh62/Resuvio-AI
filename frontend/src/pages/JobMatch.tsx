import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { CircleDashed, FileText, Zap, AlertTriangle, CheckCircle2, ArrowRight, Target, Briefcase, CheckCheck, X, ThumbsUp, Upload } from "lucide-react";
import { toast } from "sonner";
import apiClient from "@/lib/api";
import { cn } from "@/lib/utils";

// Define type for the expected analysis result from the API
// (Should match the structure returned by the backend controller)
interface MatchAnalysisResult {
  matchScore: number;
  missingKeywords: string[];
  matchingKeywords: string[];
  suggestions: string[];
}

interface UploadedResumeSummary {
  id: string;
  originalFilename: string;
}

type ApiErrorLike = {
  response?: {
    data?: {
      message?: string;
    };
  };
  request?: unknown;
  message?: string;
};

const JobMatchPage = () => {
  const [resumeFile, setResumeFile] = useState<File | null>(null);
  const [resumes, setResumes] = useState<UploadedResumeSummary[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState("");
  const [isResumeDragActive, setIsResumeDragActive] = useState(false);
  const [jobDescription, setJobDescription] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  // Update state type to use the new interface
  const [matchResult, setMatchResult] = useState<MatchAnalysisResult | null>(null);
  const [showResumeGuide, setShowResumeGuide] = useState(false);
  const [showJobGuide, setShowJobGuide] = useState(false);

  useEffect(() => {
    const fetchResumes = async () => {
      try {
        const response = await apiClient.get('/api/resumes');
        if (response.data && Array.isArray(response.data.resumes)) {
          setResumes(response.data.resumes);
        }
      } catch (err) {
        console.error("Error fetching resumes:", err);
      }
    };
    fetchResumes();
  }, []);

  const handleResumeFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setResumeFile(null); // Reset previous file
    setSelectedResumeId(""); // Clear selected existing resume
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;
      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResumeFile(selectedFile);
      } else {
        toast.error("Please upload a PDF or DOCX file for the resume.");
        setResumeFile(null);
      }
    }
  };

  const clearResumeFile = () => {
    setResumeFile(null);
    const input = document.getElementById('resume-file-upload') as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleResumeDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragActive(true);
  };

  const handleResumeDragLeave = () => {
    setIsResumeDragActive(false);
  };

  const handleResumeDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsResumeDragActive(false);
    setSelectedResumeId(""); // Clear selected existing resume
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileType = droppedFile.type;
      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setResumeFile(droppedFile);
      } else {
        toast.error("Please upload a PDF or DOCX file for the resume.");
        setResumeFile(null);
      }
    }
  };

  const handleResumeSelect = (value: string) => {
    setSelectedResumeId(value);
    clearResumeFile();
  };

  const handleMatch = async () => {
    if ((!resumeFile && !selectedResumeId) || !jobDescription.trim()) {
      toast.error("Please provide a resume and enter the job description");
      return;
    }

    setIsAnalyzing(true);
    setMatchResult(null);

    const formData = new FormData();
    if (resumeFile) {
      formData.append('resumeFile', resumeFile);
    } else if (selectedResumeId) {
      formData.append('resumeId', selectedResumeId);
    }
    formData.append('jobDescription', jobDescription);

    try {
      const response = await apiClient.post('/api/match/resume-job', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 200 && response.data.analysis) {
        setMatchResult(response.data.analysis);
        toast.success(response.data.message || "Job match analysis complete!");
      } else {
        toast.error("Analysis completed but response format was unexpected.");
        console.error("Unexpected match response:", response);
      }

    } catch (error: unknown) {
      console.error("Match Error:", error);
      const apiError = error as ApiErrorLike;
      let errorMessage = "Error analyzing job match. Please try again.";
      if (apiError.response) {
        errorMessage = apiError.response.data?.message || errorMessage;
      } else if (apiError.request) {
        errorMessage = "Network error. Could not reach the server.";
      }
      toast.error(errorMessage);
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Helper function to determine score text and color
  const getScoreData = (score: number) => {
    if (score < 50) {
      return {
        text: "Low Match",
        description: "Your resume needs significant improvements to match this job's requirements.",
        color: "text-primary",
        bgColor: "bg-primary",
        icon: <AlertTriangle className="h-6 w-6 text-primary" />,
        lightBg: "bg-secondary",
        border: "border-border"
      };
    } else if (score < 70) {
      return {
        text: "Average Match",
        description: "Your resume partially matches this job. Adding missing keywords could improve your chances.",
        color: "text-primary",
        bgColor: "bg-primary",
        icon: <AlertTriangle className="h-6 w-6 text-primary" />,
        lightBg: "bg-secondary",
        border: "border-border"
      };
    } else if (score < 90) {
      return {
        text: "Good Match",
        description: "Your resume matches well with this job. A few adjustments could make it even stronger.",
        color: "text-primary",
        bgColor: "bg-primary",
        icon: <CheckCircle2 className="h-6 w-6 text-primary" />,
        lightBg: "bg-secondary",
        border: "border-border"
      };
    } else {
      return {
        text: "Excellent Match",
        description: "Your resume is highly aligned with this job posting. You're a top candidate!",
        color: "text-primary",
        bgColor: "bg-primary",
        icon: <ThumbsUp className="h-6 w-6 text-primary" />,
        lightBg: "bg-secondary",
        border: "border-border"
      };
    }
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground font-heading tracking-tight">
              AI Job Match Analysis
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
              Let our AI analyze how well your resume aligns with specific job requirements and get tailored suggestions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 mb-10">
            <Card className="h-full shadow-sm transition-all hover:shadow-md overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm group">
              <CardHeader className="border-b border-border/40 bg-secondary/30">
                <CardTitle className="flex items-center gap-2 text-foreground font-heading">
                  <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500">
                    <FileText className="h-5 w-5" />
                  </div>
                  Your Resume
                </CardTitle>
                <CardDescription className="flex justify-between items-center text-muted-foreground text-base mt-1">
                  <span>Upload your resume (PDF or DOCX)</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 text-violet-500 hover:text-violet-600 hover:bg-violet-500/10" 
                    onClick={() => setShowResumeGuide(!showResumeGuide)}
                  >
                    {showResumeGuide ? "Hide Tips" : "Upload Tips"}
                  </Button>
                </CardDescription>
              </CardHeader>
              {showResumeGuide && (
                <div className="bg-secondary p-3 text-sm text-foreground border-b border-border">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Ensure your resume is in PDF or DOCX format.</li>
                    <li>For best results, use an up-to-date, well-formatted resume.</li>
                    <li>File size should ideally be under 5MB.</li>
                  </ul>
                </div>
              )}
              <CardContent className="p-6">
                {resumes.length > 0 && (
                  <div className="mb-6">
                    <label className="text-sm font-medium mb-2 block text-foreground">Select Existing Resume</label>
                    <Select value={selectedResumeId} onValueChange={handleResumeSelect} disabled={isAnalyzing}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Choose a previously uploaded resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((r) => (
                          <SelectItem key={r.id} value={r.id}>
                            {r.originalFilename}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <div className="relative mt-6 mb-2">
                      <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t border-border/50" />
                      </div>
                      <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or upload a new one</span>
                      </div>
                    </div>
                  </div>
                )}
                <div 
                  className={cn(
                    "flex flex-col items-center justify-center py-6 sm:py-8 md:py-12 border-2 border-dashed rounded-xl transition-all duration-300 ease-in-out relative overflow-hidden",
                    isResumeDragActive ? "border-violet-500 bg-violet-500/5" : "border-border/50 bg-secondary/30 hover:border-violet-500/50 hover:bg-secondary/50",
                    isAnalyzing && "opacity-50 cursor-not-allowed"
                  )}
                  onDragOver={handleResumeDragOver}
                  onDragLeave={handleResumeDragLeave}
                  onDrop={handleResumeDrop}
                >
                  {isResumeDragActive && <div className="absolute inset-0 bg-violet-500/5 blur-xl pointer-events-none" />}
                  <div className={cn("w-14 h-14 sm:w-16 sm:h-16 rounded-full flex items-center justify-center mb-4 transition-all z-10", resumeFile ? 'bg-violet-500/10' : 'bg-background shadow-sm')}>
                    <Upload size={24} className={cn("sm:size-[30px] transition-all", resumeFile ? 'text-violet-500' : 'text-muted-foreground')} />
                  </div>
                  <p className="text-base sm:text-lg font-medium mb-1.5 text-foreground z-10">
                    {isResumeDragActive ? "Drop your resume here" : "Drag & drop or click to upload"}
                  </p>
                  <p className="text-muted-foreground mb-5 text-xs sm:text-sm z-10">PDF or DOCX, up to 5MB</p>
                  <Input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleResumeFileChange}
                    className="hidden"
                    id="resume-file-upload"
                    disabled={isAnalyzing}
                  />
                  {!resumeFile && (
                    <label
                      htmlFor="resume-file-upload"
                      className={cn(
                        "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-white bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 h-10 px-6 py-2 z-10",
                        isAnalyzing ? "opacity-50 cursor-not-allowed" : "cursor-pointer"
                      )}
                      aria-disabled={isAnalyzing}
                    >
                      Browse Files
                    </label>
                  )}
                </div>
                {resumeFile && (
                  <div className="mt-4 text-sm flex items-center gap-2 bg-card p-3 rounded-md border border-border shadow-sm max-w-full w-full">
                    <div className="p-2 bg-secondary rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-foreground" title={resumeFile.name}>{resumeFile.name}</p>
                      <p className="text-xs text-muted-foreground">{(resumeFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                      onClick={clearResumeFile}
                      disabled={isAnalyzing}
                      title="Clear selection"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="h-full shadow-sm transition-all hover:shadow-md overflow-hidden border-border/40 bg-card/50 backdrop-blur-sm group">
              <CardHeader className="border-b border-border/40 bg-secondary/30">
                <CardTitle className="flex items-center gap-2 text-foreground font-heading">
                  <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500">
                    <Briefcase className="h-5 w-5" />
                  </div>
                  Job Description
                </CardTitle>
                <CardDescription className="flex justify-between items-center text-muted-foreground text-base mt-1">
                  <span>Paste the job description you're interested in</span>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs h-7 text-blue-500 hover:text-blue-600 hover:bg-blue-500/10" 
                    onClick={() => setShowJobGuide(!showJobGuide)}
                  >
                    {showJobGuide ? "Hide Tips" : "Show Tips"}
                  </Button>
                </CardDescription>
              </CardHeader>
              {showJobGuide && (
                <div className="bg-secondary p-3 text-sm text-foreground border-b border-border">
                  <ul className="list-disc pl-5 space-y-1">
                    <li>Copy the entire job description for best results</li>
                    <li>Include requirements, qualifications, and responsibilities</li>
                    <li>Full job descriptions provide more accurate matching</li>
                  </ul>
                </div>
              )}
              <CardContent className="p-0 h-[calc(100%-80px)]">
                <Textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="resize-none rounded-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent h-full min-h-[300px] p-6 text-base"
                  disabled={isAnalyzing}
                />
              </CardContent>
            </Card>
          </div>

          <div className="flex justify-center mb-10 md:mb-16">
            <Button
              onClick={handleMatch}
              disabled={isAnalyzing || (!resumeFile && !selectedResumeId) || !jobDescription.trim()}
              size="lg"
              className="bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white py-6 px-10 rounded-xl text-lg font-semibold transition-all duration-300 hover:scale-[1.02]"
            >
              {isAnalyzing ? (
                <>
                  <CircleDashed className="mr-3 h-6 w-6 animate-spin" />
                  AI is analyzing match...
                </>
              ) : (
                <>
                  Analyze Match with AI
                  <ArrowRight className="ml-3 h-6 w-6" />
                </>
              )}
            </Button>
          </div>

          {matchResult && (
            <div className="space-y-10 animate-in fade-in duration-500">
              {/* Match Score */}
              <Card className="overflow-hidden shadow-sm border-border/40 bg-card/50 backdrop-blur-sm">
                <CardHeader className="pb-2 border-b border-border/40 bg-secondary/30">
                  <CardTitle className="flex items-center gap-2 text-foreground font-heading">
                    <Target className="h-5 w-5 text-violet-500" />
                    AI Job Match Results
                  </CardTitle>
                  <CardDescription className="text-muted-foreground text-base mt-1">
                    How well your resume aligns with the job requirements
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-8 pb-10">
                  <div className="flex flex-col lg:flex-row items-center justify-center gap-8 md:gap-12">
                    <div className="relative">
                      <div className="w-40 h-40 sm:w-48 sm:h-48 md:w-60 md:h-60 relative">
                        {/* Background circle */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth="10"
                            strokeOpacity="0.5"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="url(#matchGradient)"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 * (1 - matchResult.matchScore / 100)}
                            className="transition-all duration-1000 ease-out"
                          />
                          <defs>
                            <linearGradient id="matchGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="hsl(var(--primary))" />
                              <stop offset="100%" stopColor="#3b82f6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        
                        {/* Score text in the center */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-4xl sm:text-5xl md:text-6xl font-bold text-foreground tracking-tight">
                            {matchResult.matchScore}%
                          </span>
                          <span className="text-sm font-medium mt-2 text-muted-foreground uppercase tracking-wider">Match Score</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="max-w-md">
                      <h3 className="text-2xl font-bold mb-4 text-foreground font-heading">{getScoreData(matchResult.matchScore).text}</h3>
                      <div className="p-6 rounded-xl mb-6 bg-secondary/50 border border-border/50">
                        <div className="flex items-start gap-4">
                          <div className="mt-1 bg-background p-2 rounded-lg shadow-sm">
                            {getScoreData(matchResult.matchScore).icon}
                          </div>
                          <div>
                            <p className="font-semibold mb-2 text-foreground text-lg">
                              {matchResult.matchScore >= 80 ? (
                                "Excellent alignment with this position!"
                              ) : matchResult.matchScore >= 60 ? (
                                "Your resume shows potential for this role"
                              ) : (
                                "Your resume needs attention for this job"
                              )}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {getScoreData(matchResult.matchScore).description}
                            </p>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-6">
                        <div className="text-sm font-medium px-3 py-1.5 rounded-full bg-violet-500/10 text-violet-600 border border-violet-500/20">
                          {matchResult.matchingKeywords.length} matching keywords
                        </div>
                        <div className="text-sm font-medium px-3 py-1.5 rounded-full bg-red-500/10 text-red-600 border border-red-500/20">
                          {matchResult.missingKeywords.length} missing keywords
                        </div>
                        <div className="text-sm font-medium px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 border border-blue-500/20">
                          {matchResult.suggestions.length} improvement tips
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Two Column Layout for Keywords */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Matching Keywords */}
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="border-b border-border bg-secondary">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <CheckCheck className="h-5 w-5 text-primary" />
                      Matching Keywords
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Keywords found in both your resume and the job description
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {matchResult.matchingKeywords?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchResult.matchingKeywords.map((keyword, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-secondary text-foreground px-3 py-1.5 rounded-full border border-border transition-all hover:bg-primary/10"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            {keyword}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <AlertTriangle className="h-10 w-10 text-border mb-2" />
                        <p>No strong keyword matches found.</p>
                        <p className="text-sm mt-1">Consider reviewing the job description more carefully.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Missing Keywords */}
                <Card className="shadow-sm border-border bg-card">
                  <CardHeader className="border-b border-border bg-secondary">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <X className="h-5 w-5 text-primary" />
                      Missing Keywords
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Important keywords from the job description missing in your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    {matchResult.missingKeywords?.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {matchResult.missingKeywords.map((keyword, index) => (
                          <div
                            key={index}
                            className="flex items-center bg-secondary text-foreground px-3 py-1.5 rounded-full border border-border transition-all hover:bg-primary/10"
                          >
                            <X className="h-3.5 w-3.5 mr-1.5 text-primary" />
                            {keyword}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                        <CheckCircle2 className="h-10 w-10 text-primary/70 mb-2" />
                        <p>No significant missing keywords identified.</p>
                        <p className="text-sm mt-1">Your resume appears to cover the job requirements well.</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Suggestions */}
              <Card className="shadow-sm border-border bg-card">
                <CardHeader className="border-b border-border bg-secondary">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Zap className="h-5 w-5 text-primary" />
                    Improvement Suggestions
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Tailored recommendations to better align your resume with this job
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                  {matchResult.suggestions?.length > 0 ? (
                    <ul className="space-y-4 max-w-3xl mx-auto">
                      {matchResult.suggestions.map((suggestion, index) => (
                        <li key={index} className="flex items-start p-3 rounded-lg transition-all duration-200 hover:bg-secondary">
                          <span className="inline-flex items-center justify-center h-7 w-7 rounded-full bg-secondary text-primary font-medium mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{suggestion}</span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
                      <CheckCircle2 className="h-10 w-10 text-primary/70 mb-2" />
                      <p>No specific suggestions available.</p>
                      <p className="text-sm mt-1">Your resume already aligns well with this job posting.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Actions */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border/40 shadow-sm relative overflow-hidden mt-8">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-blue-500/10 blur-2xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-center text-foreground font-heading">Next Steps</h3>
                <p className="text-center text-muted-foreground mb-6 sm:mb-8 max-w-xl mx-auto text-base">
                  Update your resume with the suggested improvements or analyze another job description
                </p>
                <div className="flex flex-wrap gap-4 sm:gap-6 justify-center">
                  <Button asChild variant="outline" className="min-w-44 sm:min-w-48 h-12 border-border/50 hover:bg-secondary/50 hover:text-foreground transition-all rounded-xl font-medium">
                    <a href="/dashboard/builder">
                      <FileText className="mr-2 h-5 w-5" />
                      Update Resume
                    </a>
                  </Button>
                  <Button 
                    onClick={() => {
                      setMatchResult(null);
                    }} 
                    className="min-w-44 sm:min-w-48 h-12 bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white transition-all rounded-xl font-semibold"
                  >
                    Analyze Another Job
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobMatchPage;
