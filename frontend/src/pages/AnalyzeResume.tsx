import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResumeScoreCard } from "@/components/ResumeScoreCard";
import { Input } from "@/components/ui/input";
// Removed client-side utils for parsing/analysis
// import { analyzeResume, parseResumeText, ResumeAnalysis } from "@/utils/resumeUtils";
import { toast } from "sonner";
import { CircleDashed, Upload, FileText, X, CheckCircle2, AlertTriangle, ChevronRight, ArrowRight, BarChart4, Lightbulb, Award } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import apiClient from "@/lib/api"; // Import apiClient
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Type for the nested analysis data
interface ResumeAnalysis {
  overallScore: number;
  categoryScores: {
    formatting: number;
    content: number;
    keywords: number;
    impact: number;
    [key: string]: number;
  };
  suggestions: string[];
  strengths: string[];
  analysisTimestamp?: number | string | Date;
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

// Type for the actual API response structure for analysis endpoint
interface AnalyzeApiResponse {
  message: string;
  analysis: ResumeAnalysis;
}

const AnalyzeResume = () => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadedResumeId, setUploadedResumeId] = useState<string | null>(null);
  const [uploadedResumeText, setUploadedResumeText] = useState<string | null>(null);
  const [analysisResult, setAnalysisResult] = useState<ResumeAnalysis | null>(null); // State to hold analysis results
  const [isDragActive, setIsDragActive] = useState(false);
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [selectedWorkspaceId, setSelectedWorkspaceId] = useState<string>("");

  useEffect(() => {
    const fetchWorkspaces = async () => {
      try {
        const res = await apiClient.get('/api/builder/workspaces');
        if (res.data && res.data.workspaces) {
          setWorkspaces(res.data.workspaces);
        }
      } catch (error) {
        console.error("Failed to fetch workspaces", error);
      }
    };
    fetchWorkspaces();
  }, []);

  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const uploadedId = searchParams.get("uploadedId");
    if (uploadedId) {
      const loadUploadedResume = async () => {
        setIsLoading(true);
        try {
          const res = await apiClient.get(`/api/resumes/${uploadedId}`);
          if (res.data?.resume) {
            setUploadedResumeId(uploadedId);
            if (res.data.resume.parsedText) {
              setUploadedResumeText(res.data.resume.parsedText);
            }
            if (res.data.resume.analysis) {
              setAnalysisResult(res.data.resume.analysis);
            }
          }
        } catch (error) {
          console.error("Failed to load uploaded resume", error);
          toast.error("Failed to load the selected resume.");
        } finally {
          setIsLoading(false);
        }
      };
      loadUploadedResume();
    }
  }, [searchParams]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(null);
    setUploadedResumeId(null);
    setAnalysisResult(null); // Reset analysis results when new file selected

    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      const fileType = selectedFile.type;

      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(selectedFile);
      } else {
        toast.error("Please upload a PDF or DOCX file");
      }
    }
  };

  // Function to clear the selected file
  const clearFile = () => {
    setFile(null);
    // Optionally reset input value if needed, though hiding/showing usually suffices
    const input = document.getElementById('resume-upload') as HTMLInputElement;
    if (input) input.value = "";
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(true);
  };

  const handleDragLeave = () => {
    setIsDragActive(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const droppedFile = e.dataTransfer.files[0];
      const fileType = droppedFile.type;

      if (
        fileType === "application/pdf" ||
        fileType === "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
      ) {
        setFile(droppedFile);
      } else {
        toast.error("Please upload a PDF or DOCX file");
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file to upload");
      return;
    }

    setIsLoading(true);
    setUploadedResumeId(null);
    setAnalysisResult(null); // Clear previous analysis on new upload

    const formData = new FormData();
    formData.append('resumeFile', file);

    try {
      const response = await apiClient.post('/api/resumes/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      if (response.status === 201 && response.data.resumeId) {
        setUploadedResumeId(response.data.resumeId);
        toast.success(response.data.message || "Resume uploaded successfully!");
      } else {
        toast.error("Upload succeeded but response format was unexpected.");
        console.error("Unexpected upload response:", response);
      }

    } catch (error: unknown) {
      console.error("Upload Error:", error);
      const apiError = error as ApiErrorLike;
      let errorMessage = "Error uploading resume. Please try again.";
      if (apiError.response) {
        errorMessage = apiError.response.data?.message || errorMessage;
      } else if (apiError.request) {
        errorMessage = "Network error. Could not reach the server.";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Analysis Trigger Function --- 
  const handleAnalysisTrigger = async () => {
    if (!uploadedResumeId && !selectedWorkspaceId) {
      toast.error("Please select or upload a resume to analyze.");
      return;
    }

    setIsLoading(true);
    setAnalysisResult(null);

    try {
      // Use the correct API response type here
      let response;
      if (selectedWorkspaceId) {
        response = await apiClient.post<AnalyzeApiResponse>(`/api/builder/workspace/${selectedWorkspaceId}/analyze`);
      } else {
        response = await apiClient.post<AnalyzeApiResponse>(`/api/resumes/${uploadedResumeId}/analyze`);
      }

      // Store the nested 'analysis' object from the response data
      if (response.status === 200 && response.data?.analysis) { // Check for response.data.analysis
        console.log("Received analysis data from backend:", response.data.analysis); // Log the data being set
        setAnalysisResult(response.data.analysis); // Store the nested analysis object
        toast.success(response.data.message || "Resume analysis complete!"); // Use the message from the response
      } else {
        toast.error("Analysis completed but response format was unexpected (missing analysis data).");
        console.error("Unexpected analysis response:", response);
      }

    } catch (error: unknown) {
      console.error("Analysis Error:", error);
      const apiError = error as ApiErrorLike;
      let errorMessage = "Failed to analyze resume. Please try again.";
      if (apiError.response) {
        errorMessage = apiError.response.data?.message || errorMessage;
      } else if (apiError.request) {
        errorMessage = "Network error. Could not reach the server.";
      }
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Function to reset the component state to allow another upload
  const handleUploadAnother = () => {
    setFile(null);
    setUploadedResumeId(null);
    setSelectedWorkspaceId("");
    setAnalysisResult(null);
  };

  const handleEditUploaded = async () => {
    if (!file && !uploadedResumeText) {
      toast.error("No file or resume text to import.");
      return;
    }
    setIsLoading(true);
    toast.info("Preparing your resume for the builder. This may take a few seconds...");
    try {
      let workspaceData;
      let title = "Imported from Analysis";

      if (file) {
        // 1. Parse the file into workspace data
        const formData = new FormData();
        formData.append("resumeFile", file);
        const parseRes = await apiClient.post("/api/builder/parse-upload", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        workspaceData = parseRes.data.workspaceData;
        title = file.name.replace(/\.[^.]+$/, "") || title;
      } else {
        // Fallback to parsing text if we just loaded an existing ID
        const parseRes = await apiClient.post("/api/builder/parse-text", {
          parsedText: uploadedResumeText,
          sourceFilename: "Uploaded Resume"
        });
        workspaceData = parseRes.data.workspaceData;
      }

      // 2. Save it as a new workspace
      const saveRes = await apiClient.post("/api/builder/workspace", {
        title: title,
        workspaceData: workspaceData,
      });

      const newId = saveRes.data.resumeId;
      toast.success("Resume imported successfully!");
      navigate(`/dashboard/builder?id=${newId}`);
    } catch (err) {
      toast.error("Failed to import resume to builder.");
      console.error(err);
      setIsLoading(false);
    }
  };

  // Helper function to determine score text color
  const getScoreColor = (score: number) => {
    if (score < 50) return 'text-red-500';
    if (score < 70) return 'text-amber-500';
    if (score < 90) return 'text-emerald-500';
    return 'text-indigo-600';
  };

  return (
    <div className="bg-background min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-8 md:py-12">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-8 sm:mb-10 md:mb-14">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-foreground font-heading tracking-tight">ATS Score & AI Analysis</h1>
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-2 leading-relaxed">
              Upload your resume or select a saved draft to check its ATS score and get AI-powered insights to make it stand out.
            </p>
          </div>

          {/* Progress indicators */}
          <div className="mb-6 sm:mb-8 md:mb-10">
            <div className="flex items-center justify-center max-w-2xl mx-auto">
              <div className={`flex flex-col items-center ${analysisResult ? 'opacity-50' : 'opacity-100'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${file || uploadedResumeId ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}>
                  <Upload size={18} />
                </div>
                <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-foreground">Upload</span>
              </div>
              <div className={`w-8 sm:w-12 md:w-16 h-0.5 ${uploadedResumeId || analysisResult ? 'bg-primary' : 'bg-border'} mx-1 sm:mx-2`} />
              <div className={`flex flex-col items-center ${analysisResult ? 'opacity-50' : 'opacity-100'}`}>
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${uploadedResumeId && !analysisResult ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}>
                  <BarChart4 size={18} />
                </div>
                <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-foreground">Analyze</span>
              </div>
              <div className={`w-8 sm:w-12 md:w-16 h-0.5 ${analysisResult ? 'bg-primary' : 'bg-border'} mx-1 sm:mx-2`} />
              <div className="flex flex-col items-center">
                <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${analysisResult ? 'bg-primary text-primary-foreground' : 'bg-secondary text-primary'}`}>
                  <CheckCircle2 size={18} />
                </div>
                <span className="mt-1 sm:mt-2 text-xs sm:text-sm font-medium text-foreground">Results</span>
              </div>
            </div>
          </div>

          {/* Step 1: Upload Form */}
          {!uploadedResumeId && !analysisResult && (
            <Card className="mb-8 shadow-sm animate-fade-in bg-card/50 backdrop-blur-sm border-border/40">
              <CardHeader className="border-b border-border/40 bg-secondary/30">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground font-heading">
                  <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500">
                    <Upload className="h-5 w-5" />
                  </div>
                  Step 1: Choose Your Resume
                </CardTitle>
                <CardDescription className="text-muted-foreground text-base">
                  Upload a PDF/DOCX or select a saved resume draft from the builder
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">

                {workspaces.length > 0 && (
                  <div className="mb-6 bg-card border border-border p-4 rounded-xl shadow-sm">
                    <h3 className="text-sm font-semibold mb-2">Select a Saved Resume</h3>
                    <Select value={selectedWorkspaceId} onValueChange={(val) => {
                      setSelectedWorkspaceId(val);
                      setFile(null); // Clear file if a workspace is chosen
                      setUploadedResumeId(null);
                    }}>
                      <SelectTrigger className="w-full h-11 bg-background">
                        <SelectValue placeholder="Choose a resume draft to analyze..." />
                      </SelectTrigger>
                      <SelectContent>
                        {workspaces.map((ws) => (
                          <SelectItem key={ws.id} value={ws.id}>
                            {ws.title || "Untitled Resume"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-border"></div>
                  <span className="flex-shrink-0 mx-4 text-muted-foreground text-sm font-medium">OR</span>
                  <div className="flex-grow border-t border-border"></div>
                </div>

                {/* File input area */}
                <div
                  className={`flex flex-col items-center py-6 sm:py-8 md:py-12 border-2 ${isDragActive ? 'border-primary bg-secondary' : 'border-dashed border-border bg-secondary hover:border-primary/50'} rounded-lg transition-all duration-200 ease-in-out`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-full ${file ? 'bg-primary/10' : 'bg-secondary'} flex items-center justify-center mb-3 sm:mb-4 transition-all`}>
                    <Upload size={24} className={`sm:size-[30px] ${file ? 'text-primary' : 'text-primary/70'} transition-all`} />
                  </div>
                  <p className="text-sm sm:text-lg font-medium mb-1 sm:mb-2 text-foreground">{isDragActive ? 'Drop your file here' : 'Drag and drop your resume'}</p>
                  <p className="text-muted-foreground mb-6">or</p>
                  <Input
                    type="file"
                    accept=".pdf,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                    disabled={isLoading}
                  />
                  <label
                    htmlFor="resume-upload"
                    className={`inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 text-primary-foreground bg-primary hover:bg-primary/90 h-10 px-6 py-2 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-sm hover:shadow'}`}
                    aria-disabled={isLoading}
                  >
                    Browse Files
                  </label>
                  {file && (
                    <div className="mt-6 text-sm flex items-center gap-2 bg-card p-3 rounded-md border border-border shadow-sm max-w-sm w-full">
                      <div className="p-2 bg-secondary rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="truncate font-medium text-foreground" title={file.name}>{file.name}</p>
                        <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                        onClick={clearFile}
                        disabled={isLoading}
                        title="Clear selection"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                {/* Upload or Analyze Button */}
                <div className="mt-8 flex justify-center">
                  {!selectedWorkspaceId ? (
                    <Button
                      onClick={handleUpload}
                      disabled={!file || isLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white px-8 py-6 h-12 rounded-xl transition-all duration-300 text-base font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <CircleDashed className="mr-2 h-5 w-5 animate-spin" />
                          Uploading...
                        </>
                      ) : (
                        <>
                          Upload Resume
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      onClick={handleAnalysisTrigger}
                      disabled={isLoading}
                      className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white px-8 py-6 h-12 rounded-xl transition-all duration-300 text-base font-semibold"
                    >
                      {isLoading ? (
                        <>
                          <CircleDashed className="mr-2 h-5 w-5 animate-spin" />
                          Analyzing Resume...
                        </>
                      ) : (
                        <>
                          Analyze Selected Resume
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </>
                      )}
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 2: Analyze Button */}
          {uploadedResumeId && !analysisResult && (
            <Card className="mb-8 shadow-sm border-border animate-fade-in bg-card">
              <CardHeader className="border-b border-border bg-secondary">
                <CardTitle className="flex items-center gap-2 text-xl text-foreground">
                  <BarChart4 className="h-5 w-5 text-primary" />
                  Step 2: Analyze Resume
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Your resume is uploaded and ready for AI analysis
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 p-4 bg-secondary rounded-lg mb-6">
                  <div className="flex-shrink-0">
                    <CheckCircle2 className="h-8 w-8 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">Resume uploaded successfully</p>
                    <p className="text-sm text-muted-foreground">Resume ID: {uploadedResumeId}</p>
                  </div>
                </div>

                <p className="text-center mb-8 text-muted-foreground">
                  Click the button below to get detailed scores and suggestions to improve your resume
                </p>

                {/* Button to trigger analysis */}
                <div className="flex justify-center mt-8">
                  <Button
                    onClick={handleAnalysisTrigger}
                    disabled={isLoading}
                    className="w-full sm:w-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white px-8 py-6 h-12 rounded-xl transition-all duration-300 text-base font-semibold"
                  >
                    {isLoading ? (
                      <>
                        <CircleDashed className="mr-2 h-5 w-5 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        Analyze Now
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Display Analysis Results */}
          {analysisResult && (
            <div className="space-y-10 animate-fade-in">
              {/* Overall Score */}
              <Card className="overflow-hidden shadow-sm border-border bg-card">
                <CardHeader className="pb-2 border-b border-border bg-secondary">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <BarChart4 className="h-5 w-5 text-primary" />
                    Overall Resume Score
                  </CardTitle>
                  <CardDescription className="text-muted-foreground">
                    Based on formatting, content quality, keywords, and impact
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-4 sm:pt-6">
                  <div className="flex flex-col md:flex-row items-center justify-center gap-4 sm:gap-6 md:gap-8">
                    <div className="relative">
                      <div className="w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 relative">
                        {/* Background circle */}
                        <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth="10"
                          />
                          {/* Progress circle */}
                          <circle
                            cx="60"
                            cy="60"
                            r="54"
                            fill="none"
                            stroke="hsl(var(--primary))"
                            strokeWidth="10"
                            strokeLinecap="round"
                            strokeDasharray={2 * Math.PI * 54}
                            strokeDashoffset={2 * Math.PI * 54 * (1 - analysisResult.overallScore / 100)}
                            className="transition-all duration-1000 ease-out"
                          />
                        </svg>

                        {/* Score text in the center */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground">
                            {analysisResult.overallScore}%
                          </span>
                          <span className="text-xs sm:text-sm text-muted-foreground mt-1">Overall Score</span>
                        </div>
                      </div>
                    </div>

                    <div className="max-w-md">
                      <h3 className="text-2xl font-bold mb-4 text-foreground font-heading">Score Summary</h3>
                      <div className="p-5 rounded-xl mb-4 bg-gradient-to-br from-violet-500/10 to-blue-500/10 border border-violet-500/20">
                        <div className="flex items-start gap-3">
                          <CheckCircle2 className="h-6 w-6 text-violet-500 mt-0.5" />
                          <div>
                            <p className="font-semibold mb-1 text-foreground text-lg">
                              {analysisResult.overallScore >= 80 ? 'Your resume is quite strong!' :
                                analysisResult.overallScore >= 60 ? 'Your resume is on the right track' :
                                  'Your resume needs improvement'}
                            </p>
                            <p className="text-sm text-muted-foreground leading-relaxed">
                              {analysisResult.overallScore >= 80 ? 'Your resume demonstrates strong formatting, content, and keyword optimization. Apply with confidence!' :
                                analysisResult.overallScore >= 60 ? 'Your resume has solid elements but could use improvement in some areas to stand out more.' :
                                  'Your resume requires significant improvements to be competitive in today\'s job market.'}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        <p>Analysis performed {analysisResult.analysisTimestamp ?
                          new Date(analysisResult.analysisTimestamp).toLocaleString() :
                          'recently'}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Category Scores */}
              <div>
                <h2 className="text-xl sm:text-2xl font-semibold mb-3 sm:mb-5 pl-1 border-l-4 border-primary pl-3 text-foreground">Category Breakdown</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <ResumeScoreCard
                    category="Formatting"
                    score={analysisResult?.categoryScores?.formatting || 0}
                    color="hsl(var(--primary))"
                  />
                  <ResumeScoreCard
                    category="Content Quality"
                    score={analysisResult?.categoryScores?.content || 0}
                    color="hsl(var(--primary))"
                  />
                  <ResumeScoreCard
                    category="Keywords"
                    score={analysisResult?.categoryScores?.keywords || 0}
                    color="hsl(var(--primary))"
                  />
                  <ResumeScoreCard
                    category="Impact"
                    score={analysisResult?.categoryScores?.impact || 0}
                    color="hsl(var(--primary))"
                  />
                </div>
              </div>

              {/* Two column layout for suggestions and strengths */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Suggestions */}
                <Card className="shadow-sm border-border h-full bg-card">
                  <CardHeader className="border-b border-border bg-secondary">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Lightbulb className="h-5 w-5 text-primary" />
                      Areas for Improvement
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Actionable suggestions to enhance your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {analysisResult?.suggestions?.map((suggestion, index) => (
                        <li key={index} className="flex items-start p-3 rounded-lg transition-all duration-200 hover:bg-secondary">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-primary text-sm font-medium mr-3 mt-0.5 flex-shrink-0">
                            {index + 1}
                          </span>
                          <span className="text-muted-foreground">{suggestion}</span>
                        </li>
                      )) || <li className="p-3 text-muted-foreground">No suggestions available.</li>}
                    </ul>
                  </CardContent>
                </Card>

                {/* Strengths */}
                <Card className="shadow-sm border-border h-full bg-card">
                  <CardHeader className="border-b border-border bg-secondary">
                    <CardTitle className="flex items-center gap-2 text-foreground">
                      <Award className="h-5 w-5 text-primary" />
                      Resume Strengths
                    </CardTitle>
                    <CardDescription className="text-muted-foreground">
                      Areas where your resume performs well
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="pt-6">
                    <ul className="space-y-4">
                      {analysisResult?.strengths?.map((strength, index) => (
                        <li key={index} className="flex items-start p-3 rounded-lg transition-all duration-200 hover:bg-secondary">
                          <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-secondary text-primary text-sm font-bold mr-3 mt-0.5 flex-shrink-0">
                            ✓
                          </span>
                          <span className="text-muted-foreground">{strength}</span>
                        </li>
                      )) || <li className="p-3 text-muted-foreground">No strengths highlighted.</li>}
                    </ul>
                  </CardContent>
                </Card>
              </div>

              {/* Actions After Analysis */}
              <div className="bg-card/50 backdrop-blur-sm rounded-2xl p-6 sm:p-8 border border-border/40 shadow-sm mt-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-violet-500/10 to-blue-500/10 blur-2xl -z-10 rounded-full translate-x-1/2 -translate-y-1/2" />
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-center text-foreground font-heading">Next Steps</h3>
                <p className="text-center text-muted-foreground mb-6 sm:mb-8 text-base">
                  Based on your analysis, improve your resume or find matching jobs
                </p>
                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center">
                  <Button
                    onClick={handleUploadAnother}
                    variant="outline"
                    className="min-w-32 sm:min-w-36 h-10 sm:h-12 border-border hover:bg-secondary hover:text-foreground transition-all"
                  >
                    <Upload className="mr-2 h-4 w-4" /> Analyze Another
                  </Button>
                  <Button
                    onClick={() => navigate('/dashboard/builder')}
                    className="min-w-32 sm:min-w-36 h-10 sm:h-12 bg-primary hover:bg-primary/90 text-primary-foreground transition-all"
                  >
                    <FileText className="mr-2 h-4 w-4" /> Build New Resume
                  </Button>
                  {selectedWorkspaceId ? (
                    <Button
                      onClick={() => navigate(`/dashboard/builder?id=${selectedWorkspaceId}`)}
                      className="min-w-32 sm:min-w-36 h-10 sm:h-12 bg-violet-600 hover:bg-violet-700 text-white transition-all"
                    >
                      <FileText className="mr-2 h-4 w-4" /> Edit This Resume
                    </Button>
                  ) : (file || uploadedResumeText) && uploadedResumeId ? (
                    <Button
                      onClick={handleEditUploaded}
                      disabled={isLoading}
                      className="min-w-32 sm:min-w-36 h-10 sm:h-12 bg-violet-600 hover:bg-violet-700 text-white transition-all"
                    >
                      {isLoading ? <CircleDashed className="mr-2 h-4 w-4 animate-spin" /> : <FileText className="mr-2 h-4 w-4" />}
                      Edit Uploaded Resume
                    </Button>
                  ) : null}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyzeResume;
