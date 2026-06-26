import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Download, Edit, FileText, MoreHorizontal, Plus, CircleDashed, AlertTriangle, UploadCloud, Bot, Copy, Trash2, PencilLine, Share2, Printer, BarChart3, Sparkles, Target, ScrollText, Zap, LayoutTemplate, Layers } from "lucide-react";
import { toast } from "sonner";
import apiClient from '@/lib/api';
import { format } from 'date-fns';
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { motion, AnimatePresence } from "framer-motion";

const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const cardVariant = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

interface WorkspaceSummary {
  id: string;
  title: string;
  updatedAt: { _seconds: number; _nanoseconds: number } | null;
  createdAt: { _seconds: number; _nanoseconds: number } | null;
  candidateName: string;
  headline: string;
  templateId: string;
  sectionCount: number;
}

interface UploadedResumeSummary {
  id: string;
  originalFilename: string;
  uploadTimestamp: { _seconds: number; _nanoseconds: number };
  overallScore?: number;
  analysisTimestamp?: { _seconds: number; _nanoseconds: number };
}

interface GeneratedResumeSummary {
  id: string;
  createdAt: { _seconds: number; _nanoseconds: number };
  inputName?: string;
  inputTargetRole?: string;
  version: number;
}

type ApiErrorLike = {
  response?: { data?: { message?: string } };
  message?: string;
};

const ResumeSkeletonCard = () => (
  <Card className="overflow-hidden">
    <CardHeader className="bg-secondary pb-4">
      <Skeleton className="h-5 w-3/4 mb-1" />
    </CardHeader>
    <CardContent className="p-4">
      <Skeleton className="h-4 w-1/2 mb-2" />
      <Skeleton className="h-4 w-1/4" />
    </CardContent>
    <CardFooter className="flex justify-end border-t p-3">
      <Skeleton className="h-8 w-24" />
    </CardFooter>
  </Card>
);

const UsageCard = ({ icon: Icon, label, value, subtitle }: { icon: typeof FileText; label: string; value: string | number; subtitle?: string }) => (
  <div className="flex items-center gap-4 rounded-xl border border-border/40 bg-card/50 backdrop-blur-sm p-5 hover:shadow-md transition-shadow">
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-violet-500/10 shadow-sm">
      <Icon className="h-6 w-6 text-violet-500" />
    </div>
    <div className="min-w-0 flex-1">
      <div className="text-2xl font-bold text-foreground font-heading">{value}</div>
      <div className="truncate text-sm font-medium text-muted-foreground">{label}</div>
      {subtitle && <div className="text-xs text-muted-foreground mt-0.5">{subtitle}</div>}
    </div>
  </div>
);

export default function MyResumes() {
  const navigate = useNavigate();
  const [workspaces, setWorkspaces] = useState<WorkspaceSummary[]>([]);
  const [uploadedResumes, setUploadedResumes] = useState<UploadedResumeSummary[]>([]);
  const [generatedResumes, setGeneratedResumes] = useState<GeneratedResumeSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameTitle, setRenameTitle] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [isDuplicating, setIsDuplicating] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [workspacesRes, uploadedRes, generatedRes] = await Promise.all([
        apiClient.get('/api/builder/workspaces'),
        apiClient.get('/api/resumes'),
        apiClient.get('/api/builder/generated')
      ]);

      if (workspacesRes.data && Array.isArray(workspacesRes.data.workspaces)) {
        setWorkspaces(workspacesRes.data.workspaces);
      } else {
        setWorkspaces([]);
      }

      if (uploadedRes.data && Array.isArray(uploadedRes.data.resumes)) {
        setUploadedResumes(uploadedRes.data.resumes);
      } else {
        setUploadedResumes([]);
      }

      if (generatedRes.data && Array.isArray(generatedRes.data.generatedResumes)) {
        setGeneratedResumes(generatedRes.data.generatedResumes);
      } else {
        setGeneratedResumes([]);
      }
    } catch (err: unknown) {
      const apiError = err as ApiErrorLike;
      const message = apiError.response?.data?.message || apiError.message || "Failed to load your resumes.";
      setError(message);
      toast.error(`Error loading resumes: ${message}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const handleEdit = (id: string) => {
    navigate(`/dashboard/builder?id=${id}`);
  };

  const handleCreateNew = () => {
    navigate('/dashboard/builder');
  };

  const handleOpenUploaded = (id: string) => {
    toast.info("Uploaded resume editor not available yet. Use the Resume Builder to create from scratch.");
  };

  const handleDownloadGenerated = (id: string) => {
    if (apiClient.defaults.baseURL) {
      const downloadUrl = `${apiClient.defaults.baseURL}/api/builder/download/${id}`;
      window.open(downloadUrl, '_blank');
    } else {
      toast.error("Download URL not configured");
    }
  };

  const handleRenameStart = (workspace: WorkspaceSummary) => {
    setRenamingId(workspace.id);
    setRenameTitle(workspace.title);
  };

  const handleRenameConfirm = async () => {
    if (!renamingId || !renameTitle.trim()) return;
    setIsRenaming(true);
    try {
      const workspaceData = workspaces.find(w => w.id === renamingId);
      if (!workspaceData) return;
      await apiClient.post('/api/builder/workspace', {
        resumeId: renamingId,
        title: renameTitle.trim(),
        workspaceData: { title: renameTitle.trim() }
      });
      toast.success("Resume renamed");
      setRenamingId(null);
      fetchData();
    } catch {
      toast.error("Failed to rename resume");
    } finally {
      setIsRenaming(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    setIsDuplicating(id);
    try {
      await apiClient.post(`/api/builder/workspace/${id}/duplicate`);
      toast.success("Resume duplicated");
      fetchData();
    } catch {
      toast.error("Failed to duplicate resume");
    } finally {
      setIsDuplicating(null);
    }
  };

  const handleDelete = async (id: string) => {
    setIsDeleting(id);
    try {
      await apiClient.delete(`/api/builder/workspace/${id}`);
      toast.success("Resume deleted");
      fetchData();
    } catch {
      toast.error("Failed to delete resume");
    } finally {
      setIsDeleting(null);
    }
  };

  const buildShareLink = (id: string) => `${window.location.origin}/dashboard/builder?id=${id}`;

  const buildShareText = (workspace: WorkspaceSummary) => {
    const role = workspace.headline || 'a new role';
    return `Check out my ${role} resume on Resuvio-AI: ${workspace.title}`;
  };

  const handleCopyShareLink = async (id: string) => {
    const link = buildShareLink(id);
    try {
      await navigator.clipboard.writeText(link);
      toast.success("Share link copied to clipboard");
    } catch {
      toast.error("Could not copy link. Please copy it manually.");
    }
  };

  const handleShare = async (workspace: WorkspaceSummary) => {
    const link = buildShareLink(workspace.id);
    const text = buildShareText(workspace);

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share({ title: workspace.title, text, url: link });
        return;
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    }

    try {
      await navigator.clipboard.writeText(`${text} ${link}`);
      toast.success("Share link copied. You can paste it anywhere to invite people.");
    } catch {
      toast.error("Sharing not supported. Copy the link manually.");
    }
  };

  const formatTimestamp = (timestamp?: { _seconds: number; _nanoseconds: number } | null): string => {
    if (!timestamp || typeof timestamp._seconds !== 'number') return 'Date unavailable';
    try {
      return format(new Date(timestamp._seconds * 1000), 'PPP');
    } catch {
      return 'Invalid date';
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-full space-y-6 sm:space-y-8">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0">
            <h2 className="text-2xl font-bold sm:text-3xl">My Resumes</h2>
            <p className="text-muted-foreground">Manage your resume drafts, uploads, and generated resumes</p>
          </div>
          <Button disabled className="shrink-0 self-start sm:self-auto">
            <Plus className="mr-2 h-4 w-4" /> Create New Resume
          </Button>
        </div>
        <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_minmax(280px,340px)]">
          <div className="min-w-0 space-y-6 sm:space-y-8">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2, 3].map((i) => <ResumeSkeletonCard key={`ws-${i}`} />)}
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2].map((i) => <ResumeSkeletonCard key={`up-${i}`} />)}
            </div>
            <Separator />
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {[1, 2].map((i) => <ResumeSkeletonCard key={`gen-${i}`} />)}
            </div>
          </div>
          <aside className="space-y-6">
            <Skeleton className="h-48 rounded-xl" />
            <Skeleton className="h-32 rounded-xl" />
          </aside>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-destructive">
        <AlertTriangle className="h-8 w-8 mb-2" />
        <p className="font-medium">Failed to load resumes</p>
        <p className="text-sm text-red-500">Error: {error}</p>
      </div>
    );
  }

  return (
    <div className="max-w-full space-y-6 sm:space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-3xl font-bold sm:text-4xl font-heading tracking-tight">My Resumes</h2>
          <p className="text-muted-foreground mt-1.5 text-lg">Manage your resume workspace drafts</p>
        </div>
        <Button onClick={handleCreateNew} className="shrink-0 self-start sm:self-auto bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white h-11 px-6 rounded-xl transition-all duration-300">
          <Plus className="mr-2 h-5 w-5" /> <span className="hidden sm:inline font-semibold">Create New Resume</span><span className="sm:hidden font-semibold">New</span>
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_minmax(280px,340px)]">
        {/* Left Main Area */}
        <div className="min-w-0 space-y-6 sm:space-y-8">
          {/* Resume Workspaces Section */}
          <section>
            <h3 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2 text-foreground font-heading">
              <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500 shrink-0">
                <FileText className="h-5 w-5" />
              </div>
              Resume Drafts
            </h3>
            <motion.div 
              variants={staggerContainer}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3"
            >
              {/* New Resume Card */}
              <motion.div variants={cardVariant}>
                <Card
                  className="flex cursor-pointer flex-col items-center justify-center border-2 border-dashed border-border/50 p-8 transition-all duration-300 hover:border-violet-500/50 hover:bg-violet-500/5 hover:shadow-md rounded-2xl h-full"
                  onClick={handleCreateNew}
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-violet-500/10 shadow-sm transition-transform group-hover:scale-105">
                    <Plus className="h-8 w-8 text-violet-500" />
                  </div>
                  <CardTitle className="text-xl text-foreground font-heading">New Resume</CardTitle>
                  <p className="mt-1.5 text-center text-sm text-muted-foreground">Create a new resume from scratch or upload</p>
                </Card>
              </motion.div>

              {/* Saved Workspace Cards */}
              {workspaces.length === 0 && (
                <p className="col-span-full text-sm italic text-muted-foreground">No saved drafts yet.</p>
              )}
              {workspaces.map((workspace) => (
                <motion.div key={workspace.id} variants={cardVariant} className="h-full">
                  <Card className="group overflow-hidden transition-all duration-300 hover:shadow-lg bg-card/60 backdrop-blur-md border-border/40 rounded-2xl hover:-translate-y-1 h-full flex flex-col">
                    <CardHeader className="bg-gradient-to-br from-violet-500/10 to-blue-500/10 border-b border-border/40 pb-4">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0 flex-1">
                        <CardTitle className="truncate text-lg text-foreground font-heading" title={workspace.title}>
                          {workspace.title}
                        </CardTitle>
                        {workspace.candidateName && (
                          <p className="mt-1 text-sm font-semibold text-violet-600">{workspace.candidateName}</p>
                        )}
                        {workspace.headline && (
                          <p className="truncate text-xs text-muted-foreground mt-0.5">{workspace.headline}</p>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon" className="-mt-2 -mr-2 h-8 w-8 shrink-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem onClick={() => handleEdit(workspace.id)}>
                            <Edit className="mr-2 h-4 w-4" /> Open / Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleRenameStart(workspace)}>
                            <PencilLine className="mr-2 h-4 w-4" /> Rename
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicate(workspace.id)} disabled={isDuplicating === workspace.id}>
                            {isDuplicating === workspace.id ? (
                              <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Copy className="mr-2 h-4 w-4" />
                            )}
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleShare(workspace)}>
                            <Share2 className="mr-2 h-4 w-4" /> Share
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleCopyShareLink(workspace.id)}>
                            <Copy className="mr-2 h-4 w-4" /> Copy Share Link
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDelete(workspace.id)} disabled={isDeleting === workspace.id} className="text-destructive">
                            {isDeleting === workspace.id ? (
                              <CircleDashed className="mr-2 h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="mr-2 h-4 w-4" />
                            )}
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent className="p-5">
                    <div className="flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium text-muted-foreground">
                      <span className="flex items-center"><CircleDashed className="mr-1 h-3 w-3" /> Updated: {formatTimestamp(workspace.updatedAt)}</span>
                      <span className="flex items-center"><ScrollText className="mr-1 h-3 w-3" /> {workspace.sectionCount} sections</span>
                      {workspace.templateId && <span className="capitalize flex items-center"><LayoutTemplate className="mr-1 h-3 w-3" /> {workspace.templateId.replace('-', ' ')}</span>}
                    </div>
                  </CardContent>
                  <div className="mt-auto">
                    <CardFooter className="flex justify-end gap-3 border-t border-border/40 p-4 bg-secondary/20">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-9 w-9 text-muted-foreground hover:text-violet-600 hover:bg-violet-500/10"
                        onClick={() => handleShare(workspace)}
                        title="Share resume"
                        aria-label={`Share ${workspace.title}`}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" className="h-9 font-medium border-border/50 hover:bg-secondary" onClick={() => handleEdit(workspace.id)}>
                        <Edit className="mr-2 h-4 w-4" /> Open Editor
                      </Button>
                    </CardFooter>
                  </div>
                </Card>
              </motion.div>
              ))}
            </motion.div>
          </section>

          {uploadedResumes.length > 0 && (
            <>
              <Separator className="my-8" />
              <section>
                <h3 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2 text-foreground font-heading">
                  <div className="p-1.5 rounded-md bg-cyan-500/10 text-cyan-500 shrink-0">
                    <UploadCloud className="h-5 w-5" />
                  </div>
                  Uploaded Resumes
                </h3>
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {uploadedResumes.map((resume) => (
                    <motion.div key={resume.id} variants={cardVariant} className="h-full">
                      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg bg-card/60 backdrop-blur-md border-border/40 rounded-2xl hover:-translate-y-1">
                        <CardHeader className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 border-b border-border/40 pb-4">
                        <CardTitle className="truncate text-lg text-foreground font-heading">{resume.originalFilename || `Resume ${resume.id.substring(0, 6)}`}</CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-muted-foreground flex items-center"><CircleDashed className="mr-1 h-3 w-3" /> {formatTimestamp(resume.uploadTimestamp)}</span>
                          {resume.overallScore !== undefined && (
                            <span className="font-bold text-cyan-600 bg-cyan-500/10 px-2 py-1 rounded-md text-sm">{resume.overallScore}/100</span>
                          )}
                        </div>
                      </CardContent>
                      <div className="mt-auto">
                        <CardFooter className="flex justify-end border-t border-border/40 p-4 gap-2 bg-secondary/20">
                          <Button variant="ghost" size="sm" className="h-9 font-medium hover:text-cyan-600 hover:bg-cyan-500/10" onClick={() => handleOpenUploaded(resume.id)}>
                            <Edit className="mr-2 h-4 w-4" /> View Details
                          </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  </motion.div>
                  ))}
                </motion.div>
              </section>
            </>
          )}

          {generatedResumes.length > 0 && (
            <>
              <Separator className="my-8" />
              <section>
                <h3 className="text-xl sm:text-2xl font-bold mb-5 flex items-center gap-2 text-foreground font-heading">
                  <div className="p-1.5 rounded-md bg-purple-500/10 text-purple-500 shrink-0">
                    <Bot className="h-5 w-5" />
                  </div>
                  AI Generated Resumes
                </h3>
                <motion.div 
                  variants={staggerContainer}
                  initial="hidden"
                  animate="show"
                  className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5"
                >
                  {generatedResumes.map((resume) => (
                    <motion.div key={resume.id} variants={cardVariant} className="h-full">
                      <Card className="h-full flex flex-col overflow-hidden transition-all duration-300 hover:shadow-lg bg-card/60 backdrop-blur-md border-border/40 rounded-2xl hover:-translate-y-1">
                        <CardHeader className="bg-gradient-to-br from-purple-500/10 to-pink-500/10 border-b border-border/40 pb-4">
                        <CardTitle className="truncate text-lg text-foreground font-heading">
                          {resume.inputName ? `${resume.inputName}'s Resume` : 'Generated Resume'}
                          {resume.inputTargetRole ? ` (${resume.inputTargetRole})` : ''}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="p-5">
                        <div className="text-xs font-medium text-muted-foreground space-y-2">
                          <p className="flex items-center"><CircleDashed className="mr-1.5 h-3 w-3" /> Generated: {formatTimestamp(resume.createdAt)}</p>
                          <p className="flex items-center"><Layers className="mr-1.5 h-3 w-3" /> Version: {resume.version}</p>
                        </div>
                      </CardContent>
                      <div className="mt-auto">
                        <CardFooter className="flex justify-end border-t border-border/40 p-4 bg-secondary/20">
                          <Button variant="outline" size="sm" className="h-9 font-medium border-border/50 hover:bg-purple-500/10 hover:text-purple-600 hover:border-purple-500/30" onClick={() => handleDownloadGenerated(resume.id)}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                          </Button>
                        </CardFooter>
                      </div>
                    </Card>
                  </motion.div>
                  ))}
                </motion.div>
              </section>
            </>
          )}
        </div>

        {/* Right Sidebar */}
        <aside className="space-y-6">
          {/* Monthly Usage Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/40 bg-secondary/30">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground font-heading">
                <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-500 shrink-0">
                  <BarChart3 className="h-5 w-5" />
                </div>
                Monthly Usage
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <UsageCard icon={Download} label="PDF Downloads" value={generatedResumes.length} />
              <UsageCard icon={Target} label="JD Score" value={workspaces.filter(w => w.sectionCount > 3).length} subtitle="resumes scored" />
              <UsageCard icon={Sparkles} label="AI Suggestions" value={0} subtitle="this month" />
              <UsageCard icon={ScrollText} label="Cover Letters" value={0} subtitle="generated" />
            </CardContent>
          </Card>

          {/* Referral / Share Card */}
          <Card className="bg-card/50 backdrop-blur-sm border-border/40 shadow-sm rounded-2xl overflow-hidden">
            <CardHeader className="pb-4 border-b border-border/40 bg-secondary/30">
              <CardTitle className="text-lg flex items-center gap-2 text-foreground font-heading">
                <div className="p-1.5 rounded-md bg-blue-500/10 text-blue-500 shrink-0">
                  <Share2 className="h-5 w-5" />
                </div>
                Share Resuvio-AI
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 pt-5">
              <p className="text-sm text-muted-foreground leading-relaxed">Help others build better resumes. Share the tool with your network!</p>
              <Button
                className="w-full bg-gradient-to-r from-violet-600 to-blue-600 hover:shadow-lg hover:shadow-primary/25 text-white h-11 rounded-xl transition-all"
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  toast.success("Link copied!");
                }}
              >
                <Share2 className="mr-2 h-4 w-4" /> Copy Share Link
              </Button>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <div className="rounded-2xl border border-border/40 bg-card/50 backdrop-blur-sm p-6 shadow-sm">
            <h4 className="mb-4 text-sm font-bold text-muted-foreground uppercase tracking-widest flex items-center">
              <Zap className="h-4 w-4 mr-2 text-amber-500" /> Quick Stats
            </h4>
            <div className="space-y-3 text-sm font-medium text-foreground">
              <div className="flex justify-between">
                <span>Drafts Saved</span>
                <strong>{workspaces.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>Uploads</span>
                <strong>{uploadedResumes.length}</strong>
              </div>
              <div className="flex justify-between">
                <span>AI Generated</span>
                <strong>{generatedResumes.length}</strong>
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Rename Dialog */}
      <Dialog open={!!renamingId} onOpenChange={(open) => { if (!open) setRenamingId(null); }}>
        <DialogContent className="max-w-md sm:rounded-2xl border-border/40">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Rename Resume</DialogTitle>
            <DialogDescription className="text-base">Enter a new name for this resume draft.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Label htmlFor="rename-title" className="font-medium">Resume Title</Label>
            <Input
              id="rename-title"
              value={renameTitle}
              onChange={(e) => setRenameTitle(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleRenameConfirm(); }}
              placeholder="My Resume Title"
              className="h-11 border-border/50 bg-background focus:ring-1 focus:ring-violet-500"
              autoFocus
            />
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="outline" className="rounded-xl border-border/50 hover:bg-secondary" onClick={() => setRenamingId(null)}>Cancel</Button>
            <Button onClick={handleRenameConfirm} className="rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors" disabled={isRenaming || !renameTitle.trim()}>
              {isRenaming ? <CircleDashed className="mr-2 h-4 w-4 animate-spin" /> : <PencilLine className="mr-2 h-4 w-4" />}
              Rename
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}