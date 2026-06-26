import { useEffect, useMemo, useRef, useState } from "react";
import type React from "react";
import { useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  BriefcaseBusiness,
  CheckCircle2,
  CircleDashed,
  Download,
  FileText,
  GripVertical,
  LayoutTemplate,
  Lightbulb,
  Lock,
  Plus,
  Redo2,
  Save,
  Settings,
  Trash2,
  Undo2,
  Upload,
  WandSparkles,
  X,
} from "lucide-react";
import { useResumeHistory } from "@/hooks/useResumeHistory";
import { toast } from "sonner";
import html2pdf from "html2pdf.js";
import apiClient from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  addableSections,
  calculateStrength,
  createInitialWorkspace,
  EditorShell,
  EntryList,
  Field,
  getPresetAccent,
  isSectionId,
  isTemplateId,
  layoutPresets,
  requiredSections,
  ResumePreview,
  sectionMeta,
  TemplateDialog,
  ToolPanelContent,
  contextualTips,
} from "@/components/resume-builder";
import type {
  ApiErrorLike,
  LayoutPreset,
  MobileView,
  ResumeWorkspace,
  SectionId,
  TemplateId,
  ToolPanel,
} from "@/components/resume-builder";

const normalizeWorkspace = (
  workspaceData: Partial<ResumeWorkspace>,
  fallbackTitle = "Untitled Resume",
  currentTemplateId: TemplateId = "modern"
): ResumeWorkspace => {
  const base = createInitialWorkspace(
    isTemplateId(workspaceData.templateId) ? workspaceData.templateId : currentTemplateId
  );
  const next: ResumeWorkspace = {
    ...base,
    ...workspaceData,
    title: workspaceData.title || fallbackTitle,
    templateId: isTemplateId(workspaceData.templateId)
      ? workspaceData.templateId
      : base.templateId,
    customization: { ...base.customization, ...(workspaceData.customization || {}) },
    personal: { ...base.personal, ...(workspaceData.personal || {}) },
    experience:
      Array.isArray(workspaceData.experience) && workspaceData.experience.length
        ? workspaceData.experience
        : base.experience,
    education:
      Array.isArray(workspaceData.education) && workspaceData.education.length
        ? workspaceData.education
        : base.education,
    skills:
      Array.isArray(workspaceData.skills) && workspaceData.skills.length
        ? workspaceData.skills
        : base.skills,
    projects: Array.isArray(workspaceData.projects) ? workspaceData.projects : [],
    certifications: Array.isArray(workspaceData.certifications)
      ? workspaceData.certifications
      : [],
    extras: workspaceData.extras || {},
    sections: Array.isArray(workspaceData.sections)
      ? workspaceData.sections.filter(isSectionId)
      : base.sections,
  };

  next.sections = Array.from(new Set(["personal", ...next.sections]));
  for (const requiredSection of requiredSections) {
    if (!next.sections.includes(requiredSection)) next.sections.push(requiredSection);
  }
  if (next.projects.length > 0 && !next.sections.includes("projects"))
    next.sections.push("projects");
  if (next.certifications.length > 0 && !next.sections.includes("certifications"))
    next.sections.push("certifications");

  return next;
};

const ResumeBuilder = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialResumeId = searchParams.get("id");
  const [resumeId, setResumeId] = useState<string | null>(initialResumeId);
  const [resume, setResume] = useState<ResumeWorkspace>(() => createInitialWorkspace());
  const [activeSection, setActiveSection] = useState<SectionId>("personal");
  const [activeTool, setActiveTool] = useState<ToolPanel>(null);
  const [templateDialogOpen, setTemplateDialogOpen] = useState(!initialResumeId);
  const [startDialogOpen, setStartDialogOpen] = useState(false);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [analyzingDialogOpen, setAnalyzingDialogOpen] = useState(false);
  const [isSwitchingTemplate, setIsSwitchingTemplate] = useState(false);
  const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
  const [removeMode, setRemoveMode] = useState(false);
  const [reorderMode, setReorderMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isAssisting, setIsAssisting] = useState(false);
  const [isParsingUpload, setIsParsingUpload] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [savedState, setSavedState] = useState<"saved" | "unsaved">("unsaved");
  const [mobileView, setMobileView] = useState<MobileView>("editor");
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  // Track whether user has manually edited the title
  const [titleManuallyEdited, setTitleManuallyEdited] = useState(false);
  const previewRef = useRef<HTMLDivElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const { pushState, undo, redo, canUndo, canRedo } = useResumeHistory(resume);
  const [dismissedTips, setDismissedTips] = useState<Set<string>>(new Set());

  const strength = useMemo(() => calculateStrength(resume), [resume]);
  const previewAccent =
    resume.customization.accentColor || getPresetAccent(resume.stylePreset);

  const resumeRef = useRef(resume);
  resumeRef.current = resume;
  useEffect(() => {
    const timer = setTimeout(() => {
      pushState(resumeRef.current);
    }, 500);
    return () => clearTimeout(timer);
  }, [resume, pushState]);

  useEffect(() => {
    const currentId = searchParams.get("id");
    if (!currentId) return;

    let cancelled = false;
    const loadWorkspace = async () => {
      try {
        const response = await apiClient.get(`/api/builder/workspace/${currentId}`);
        if (cancelled) return;
        setResume(
          normalizeWorkspace(
            response.data.workspaceData as Partial<ResumeWorkspace>,
            "Untitled Resume",
            resume.templateId
          )
        );
        setResumeId(currentId);
        setSavedState("saved");
        setTemplateDialogOpen(false);
        setStartDialogOpen(false);
        setUploadDialogOpen(false);
        setAnalyzingDialogOpen(false);
        // Loaded resume has a real title so mark as manually edited
        setTitleManuallyEdited(true);
      } catch (error: unknown) {
        const apiError = error as ApiErrorLike;
        toast.error(apiError.response?.data?.message || "Could not load saved resume");
      }
    };

    loadWorkspace();
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const updateResume = (updater: (current: ResumeWorkspace) => ResumeWorkspace) => {
    setSavedState("unsaved");
    setResume((current) => updater(structuredClone(current)));
  };

  // Undo/Redo keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "z") {
        e.preventDefault();
        if (e.shiftKey) {
          const restored = redo(resumeRef.current);
          if (restored) setResume(restored);
        } else {
          const restored = undo(resumeRef.current);
          if (restored) setResume(restored);
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [undo, redo]);

  const handleUndo = () => {
    const restored = undo(resumeRef.current);
    if (restored) setResume(restored);
  };

  const handleRedo = () => {
    const restored = redo(resumeRef.current);
    if (restored) setResume(restored);
  };

  const handleTemplateSelect = (templateId: TemplateId) => {
    updateResume((draft) => {
      draft.templateId = templateId;
      return draft;
    });
    setTemplateDialogOpen(false);
    if (isSwitchingTemplate || resumeId) {
      setIsSwitchingTemplate(false);
      return;
    }
    setStartDialogOpen(true);
  };

  const startFromScratch = () => {
    const blank = createInitialWorkspace(resume.templateId);
    setResume(blank);
    setResumeId(null);
    setSearchParams({});
    setActiveSection("personal");
    setStartDialogOpen(false);
    setSavedState("unsaved");
    setTitleManuallyEdited(false);
  };

  const openSwitchTemplate = () => {
    setIsSwitchingTemplate(true);
    setTemplateDialogOpen(true);
  };

  const chooseUploadFile = () => {
    uploadInputRef.current?.click();
  };

  // Toggle tool with left sidebar auto-close
  const handleToolToggle = (tool: ToolPanel) => {
    if (activeTool === tool) {
      setActiveTool(null);
      // Restore left sidebar when tool closes
      setLeftSidebarOpen(true);
    } else {
      setActiveTool(tool);
      // Auto-close left sidebar when tool opens
      setLeftSidebarOpen(false);
    }
  };

  const handleUploadSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Please upload a file smaller than 5MB.");
      return;
    }

    setUploadDialogOpen(false);
    setAnalyzingDialogOpen(true);
    setIsParsingUpload(true);
    setAnalysisStep(0);

    const timer = window.setInterval(() => {
      setAnalysisStep((step) => Math.min(step + 1, 2));
    }, 1000);

    try {
      const formData = new FormData();
      formData.append("resumeFile", file);

      const response = await apiClient.post("/api/builder/parse-upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      window.clearInterval(timer);
      setAnalysisStep(3);

      const parsedWorkspace = normalizeWorkspace(
        {
          ...(response.data.workspaceData as Partial<ResumeWorkspace>),
          templateId: resume.templateId,
        },
        file.name.replace(/\.[^.]+$/, "") || "Imported Resume",
        resume.templateId
      );

      window.setTimeout(() => {
        setResume(parsedWorkspace);
        setResumeId(null);
        setSearchParams({});
        setActiveSection("personal");
        setAnalyzingDialogOpen(false);
        setSavedState("unsaved");
        // Uploaded resume derives title from filename, mark as edited
        setTitleManuallyEdited(true);
        toast.success("Resume imported. Review the fields before saving.");
      }, 500);
    } catch (error: unknown) {
      window.clearInterval(timer);
      setAnalyzingDialogOpen(false);
      setUploadDialogOpen(true);
      const apiError = error as ApiErrorLike;
      toast.error(apiError.response?.data?.message || "Could not import this resume");
    } finally {
      setIsParsingUpload(false);
    }
  };

  const saveWorkspace = async () => {
    setIsSaving(true);
    try {
      const response = await apiClient.post("/api/builder/workspace", {
        resumeId,
        title: resume.title,
        workspaceData: resume,
      });
      const nextId = response.data?.resumeId as string | undefined;
      if (nextId && nextId !== resumeId) {
        setResumeId(nextId);
        setSearchParams({ id: nextId });
      }
      setSavedState("saved");
      toast.success(response.data?.message || "Resume saved");
    } catch (error: unknown) {
      const apiError = error as ApiErrorLike;
      toast.error(apiError.response?.data?.message || "Could not save resume");
    } finally {
      setIsSaving(false);
    }
  };

  const printPreview = async () => {
    const contentElement = previewRef.current;
    if (!contentElement) {
      toast.error("Preview is not ready yet");
      return;
    }

    // Temporarily remove shadow and fixed min-height to prevent html2pdf from adding an extra blank page
    const printPage = contentElement.querySelector('.print-page');
    let hasShadow = false;
    let hasMinHeight = false;
    
    if (printPage) {
      if (printPage.classList.contains('shadow-xl')) {
        hasShadow = true;
        printPage.classList.remove('shadow-xl');
      }
      if (printPage.classList.contains('min-h-[1123px]')) {
        hasMinHeight = true;
        printPage.classList.remove('min-h-[1123px]');
      }
    }
    
    toast.info("Generating PDF... this may take a few seconds.", {
      duration: 3000,
    });
    
    const opt = {
      margin:       0,
      filename:     `${(resume.title || 'Resume').replace(/\s+/g, '_')}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2, useCORS: true },
      jsPDF:        { unit: 'in', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      await html2pdf().set(opt).from(contentElement).save();
      toast.success("PDF downloaded successfully!");
    } catch (e) {
      toast.error("Failed to generate PDF.");
    } finally {
      // Restore the styles
      if (printPage) {
        if (hasShadow) printPage.classList.add('shadow-xl');
        if (hasMinHeight) printPage.classList.add('min-h-[1123px]');
      }
    }
  };

  const aiAssist = async (
    fieldType: string,
    currentText: string,
    apply: (suggestion: string) => void
  ) => {
    setIsAssisting(true);
    try {
      const response = await apiClient.post("/api/builder/assist", {
        fieldType,
        currentText,
        context: `${resume.personal.headline}\n${resume.targetJobDescription}`,
      });
      apply(response.data.suggestion || "");
      setSavedState("unsaved");
      toast.success("AI suggestion applied");
    } catch (error: unknown) {
      const apiError = error as ApiErrorLike;
      toast.error(apiError.response?.data?.message || "AI assist failed");
    } finally {
      setIsAssisting(false);
    }
  };

  const addSection = (sectionId: SectionId) => {
    updateResume((draft) => {
      if (!draft.sections.includes(sectionId)) draft.sections.push(sectionId);
      if (
        !draft.extras[sectionId] &&
        !requiredSections.includes(sectionId) &&
        sectionId !== "projects" &&
        sectionId !== "certifications"
      ) {
        draft.extras[sectionId] = {
          id: sectionId,
          title: sectionMeta[sectionId].label,
          content: "",
        };
      }
      if (sectionId === "projects" && draft.projects.length === 0) {
        draft.projects.push({ name: "", role: "", technologies: "", link: "", description: "" });
      }
      if (sectionId === "certifications" && draft.certifications.length === 0) {
        draft.certifications.push({ name: "", issuer: "", date: "" });
      }
      return draft;
    });
    setActiveSection(sectionId);
    setIsAddSectionOpen(false);
  };

  const removeSection = (sectionId: SectionId) => {
    if (sectionMeta[sectionId].locked) return;
    updateResume((draft) => {
      draft.sections = draft.sections.filter((id) => id !== sectionId);
      if (draft.extras[sectionId]) delete draft.extras[sectionId];
      return draft;
    });
    setActiveSection("personal");
  };

  const moveSection = (sectionId: SectionId, direction: -1 | 1) => {
    updateResume((draft) => {
      const index = draft.sections.indexOf(sectionId);
      const nextIndex = index + direction;
      if (index < 0 || nextIndex < 0 || nextIndex >= draft.sections.length) return draft;
      const [item] = draft.sections.splice(index, 1);
      draft.sections.splice(nextIndex, 0, item);
      return draft;
    });
  };

  const applyLayoutPreset = (layoutPreset: LayoutPreset) => {
    const preset = layoutPresets.find((item) => item.id === layoutPreset);
    if (!preset) return;
    updateResume((draft) => {
      const existingExtras = draft.sections.filter((section) => !preset.order.includes(section));
      draft.layoutPreset = layoutPreset;
      draft.sections = [...preset.order, ...existingExtras];
      return draft;
    });
  };

  const sectionIndex = resume.sections.indexOf(activeSection);
  const goToSection = (direction: -1 | 1) => {
    const next = resume.sections[sectionIndex + direction];
    if (next) setActiveSection(next);
  };

  const renderEditor = () => {
    switch (activeSection) {
      case "personal":
        return (
          <EditorShell title="Personal Info">
            <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
              <Field label="Full Name">
                <Input
                  value={resume.personal.name}
                  onChange={(e) =>
                    updateResume((draft) => {
                      draft.personal.name = e.target.value;
                      // FIX: Auto-update title from full name if not manually edited
                      if (!titleManuallyEdited) {
                        const trimmed = e.target.value.trim();
                        draft.title = trimmed || "Untitled Resume";
                      }
                      return draft;
                    })
                  }
                />
              </Field>
              <Field label="Professional Headline">
                <Input
                  value={resume.personal.headline}
                  onChange={(e) =>
                    updateResume((draft) => { draft.personal.headline = e.target.value; return draft; })
                  }
                />
              </Field>
              <Field label="Email Address">
                <Input
                  value={resume.personal.email}
                  onChange={(e) =>
                    updateResume((draft) => { draft.personal.email = e.target.value; return draft; })
                  }
                />
              </Field>
              <Field label="Phone Number">
                <Input
                  value={resume.personal.phone}
                  onChange={(e) =>
                    updateResume((draft) => { draft.personal.phone = e.target.value; return draft; })
                  }
                />
              </Field>
              <Field label="Location (City, State)" className="md:col-span-2">
                <Input
                  value={resume.personal.location}
                  onChange={(e) =>
                    updateResume((draft) => { draft.personal.location = e.target.value; return draft; })
                  }
                />
              </Field>
            </div>
            <div className="pt-4 mt-2">
              <div className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground/70 sm:mb-4">
                Social & Web Links
              </div>
              {resume.personal.links.map((link, index) => (
                <div key={index} className="mb-2 flex gap-2">
                  <Input
                    value={link}
                    onChange={(e) =>
                      updateResume((draft) => { draft.personal.links[index] = e.target.value; return draft; })
                    }
                    placeholder="linkedin.com/in/name"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() =>
                      updateResume((draft) => { draft.personal.links.splice(index, 1); return draft; })
                    }
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                variant="ghost"
                onClick={() =>
                  updateResume((draft) => { draft.personal.links.push(""); return draft; })
                }
                className="text-sm"
              >
                <Plus className="mr-1 h-4 w-4" /> Add Link
              </Button>
            </div>
          </EditorShell>
        );

      case "summary":
        return (
          <EditorShell
            title="Summary"
            onAssist={() =>
              aiAssist("professional summary", resume.summary, (s) =>
                updateResume((draft) => { draft.summary = s; return draft; })
              )
            }
            isAssisting={isAssisting}
          >
            <Field label="Professional Summary">
              <Textarea
                value={resume.summary}
                onChange={(e) =>
                  updateResume((draft) => { draft.summary = e.target.value; return draft; })
                }
                rows={8}
                placeholder="Results-driven professional with..."
              />
            </Field>
            <p className="text-xs text-muted-foreground sm:text-sm">
              2–4 sentences. Lead with your role, years of experience, and biggest strength.
            </p>
          </EditorShell>
        );

      case "experience":
        return (
          <EditorShell title="Work Experience">
            <EntryList
              items={resume.experience}
              label="Work Experience"
              addLabel="Add Position"
              onAdd={() =>
                updateResume((draft) => {
                  draft.experience.push({ jobTitle: "", company: "", employmentType: "", location: "", dates: "", description: "" });
                  return draft;
                })
              }
              onRemove={(i) =>
                updateResume((draft) => { draft.experience.splice(i, 1); return draft; })
              }
              render={(item, i) => (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <Field label="Job Title">
                    <Input value={item.jobTitle} onChange={(e) => updateResume((d) => { d.experience[i].jobTitle = e.target.value; return d; })} />
                  </Field>
                  <Field label="Company">
                    <Input value={item.company} onChange={(e) => updateResume((d) => { d.experience[i].company = e.target.value; return d; })} />
                  </Field>
                  <Field label="Employment Type">
                    <Input value={item.employmentType} onChange={(e) => updateResume((d) => { d.experience[i].employmentType = e.target.value; return d; })} />
                  </Field>
                  <Field label="Location">
                    <Input value={item.location} onChange={(e) => updateResume((d) => { d.experience[i].location = e.target.value; return d; })} />
                  </Field>
                  <Field label="Dates">
                    <Input value={item.dates} onChange={(e) => updateResume((d) => { d.experience[i].dates = e.target.value; return d; })} />
                  </Field>
                  <Field label="Description" className="md:col-span-2">
                    <div className="mb-2 flex justify-end">
                      <Button size="sm" variant="outline" disabled={isAssisting}
                        onClick={() => aiAssist("work experience bullet points", item.description, (s) => updateResume((d) => { d.experience[i].description = s; return d; }))}>
                        <WandSparkles className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">AI Assist</span>
                      </Button>
                    </div>
                    <Textarea value={item.description} rows={7} onChange={(e) => updateResume((d) => { d.experience[i].description = e.target.value; return d; })} />
                  </Field>
                </div>
              )}
            />
          </EditorShell>
        );

      case "education":
        return (
          <EditorShell title="Education">
            <EntryList
              items={resume.education}
              label="Education"
              addLabel="Add Qualification"
              onAdd={() =>
                updateResume((draft) => {
                  draft.education.push({ degree: "", institution: "", honors: "", dates: "", gpa: "", description: "" });
                  return draft;
                })
              }
              onRemove={(i) =>
                updateResume((draft) => { draft.education.splice(i, 1); return draft; })
              }
              render={(item, i) => (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <Field label="Degree & Major">
                    <Input value={item.degree} onChange={(e) => updateResume((d) => { d.education[i].degree = e.target.value; return d; })} />
                  </Field>
                  <Field label="Institution">
                    <Input value={item.institution} onChange={(e) => updateResume((d) => { d.education[i].institution = e.target.value; return d; })} />
                  </Field>
                  <Field label="Honors / Minor">
                    <Input value={item.honors} onChange={(e) => updateResume((d) => { d.education[i].honors = e.target.value; return d; })} />
                  </Field>
                  <Field label="Dates">
                    <Input value={item.dates} onChange={(e) => updateResume((d) => { d.education[i].dates = e.target.value; return d; })} />
                  </Field>
                  <Field label="GPA">
                    <Input value={item.gpa} onChange={(e) => updateResume((d) => { d.education[i].gpa = e.target.value; return d; })} />
                  </Field>
                  <Field label="Description" className="md:col-span-2">
                    <Textarea value={item.description} rows={5} onChange={(e) => updateResume((d) => { d.education[i].description = e.target.value; return d; })} />
                  </Field>
                </div>
              )}
            />
          </EditorShell>
        );

      case "skills":
        return (
          <EditorShell title="Skills">
            <EntryList
              items={resume.skills}
              label="Skills"
              addLabel="Add Skill Category"
              onAdd={() =>
                updateResume((draft) => { draft.skills.push({ category: "", items: "" }); return draft; })
              }
              onRemove={(i) =>
                updateResume((draft) => { draft.skills.splice(i, 1); return draft; })
              }
              render={(item, i) => (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <Field label="Category">
                    <Input value={item.category} onChange={(e) => updateResume((d) => { d.skills[i].category = e.target.value; return d; })} />
                  </Field>
                  <Field label="Skills (comma separated)">
                    <Input value={item.items} onChange={(e) => updateResume((d) => { d.skills[i].items = e.target.value; return d; })} />
                  </Field>
                </div>
              )}
            />
          </EditorShell>
        );

      case "projects":
        return (
          <EditorShell title="Projects">
            <EntryList
              items={resume.projects}
              label="Projects"
              addLabel="Add Project"
              onAdd={() =>
                updateResume((draft) => { draft.projects.push({ name: "", role: "", technologies: "", link: "", description: "" }); return draft; })
              }
              onRemove={(i) =>
                updateResume((draft) => { draft.projects.splice(i, 1); return draft; })
              }
              render={(item, i) => (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <Field label="Project Name">
                    <Input value={item.name} onChange={(e) => updateResume((d) => { d.projects[i].name = e.target.value; return d; })} />
                  </Field>
                  <Field label="Role">
                    <Input value={item.role} onChange={(e) => updateResume((d) => { d.projects[i].role = e.target.value; return d; })} />
                  </Field>
                  <Field label="Tech Stack">
                    <Input value={item.technologies} onChange={(e) => updateResume((d) => { d.projects[i].technologies = e.target.value; return d; })} />
                  </Field>
                  <Field label="Link">
                    <Input value={item.link} onChange={(e) => updateResume((d) => { d.projects[i].link = e.target.value; return d; })} />
                  </Field>
                  <Field label="Description" className="md:col-span-2">
                    <div className="mb-2 flex justify-end">
                      <Button size="sm" variant="outline" disabled={isAssisting}
                        onClick={() => aiAssist("project description", item.description, (s) => updateResume((d) => { d.projects[i].description = s; return d; }))}>
                        <WandSparkles className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                        <span className="text-xs sm:text-sm">AI Assist</span>
                      </Button>
                    </div>
                    <Textarea value={item.description} rows={6} onChange={(e) => updateResume((d) => { d.projects[i].description = e.target.value; return d; })} />
                  </Field>
                </div>
              )}
            />
          </EditorShell>
        );

      case "certifications":
        return (
          <EditorShell title="Certifications">
            <EntryList
              items={resume.certifications}
              label="Certifications"
              addLabel="Add Certification"
              onAdd={() =>
                updateResume((draft) => { draft.certifications.push({ name: "", issuer: "", date: "" }); return draft; })
              }
              onRemove={(i) =>
                updateResume((draft) => { draft.certifications.splice(i, 1); return draft; })
              }
              render={(item, i) => (
                <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
                  <Field label="Certification Name">
                    <Input value={item.name} onChange={(e) => updateResume((d) => { d.certifications[i].name = e.target.value; return d; })} />
                  </Field>
                  <Field label="Issuing Organization">
                    <Input value={item.issuer} onChange={(e) => updateResume((d) => { d.certifications[i].issuer = e.target.value; return d; })} />
                  </Field>
                  <Field label="Date Obtained">
                    <Input value={item.date} onChange={(e) => updateResume((d) => { d.certifications[i].date = e.target.value; return d; })} />
                  </Field>
                </div>
              )}
            />
          </EditorShell>
        );

      default: {
        const extra = resume.extras[activeSection] || {
          id: activeSection,
          title: sectionMeta[activeSection].label,
          content: "",
        };
        return (
          <EditorShell title={extra.title}>
            <Field label="Section Title">
              <Input
                value={extra.title}
                onChange={(e) =>
                  updateResume((draft) => { draft.extras[activeSection] = { ...extra, title: e.target.value }; return draft; })
                }
              />
            </Field>
            <Field label="Content">
              <Textarea
                value={extra.content}
                rows={10}
                onChange={(e) =>
                  updateResume((draft) => { draft.extras[activeSection] = { ...extra, content: e.target.value }; return draft; })
                }
              />
            </Field>
          </EditorShell>
        );
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background text-foreground">

      {/* ── Header ── */}
      <header className="flex h-12 flex-shrink-0 items-center justify-between border-b border-border/40 bg-secondary/30 backdrop-blur-md px-2 shadow-sm sm:h-14 sm:px-3 md:h-[60px] md:px-4 lg:h-[68px] lg:px-5">
        <div className="flex min-w-0 items-center gap-1 sm:gap-2 md:gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => window.history.back()}
            className="h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9 hover:bg-violet-500/10 hover:text-violet-600 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="hidden h-5 border-l border-border/50 sm:block" />
          <Input
            value={resume.title}
            onChange={(e) =>
              updateResume((draft) => { draft.title = e.target.value; return draft; })
            }
            className="h-8 w-24 border-0 bg-transparent px-1 text-sm font-bold shadow-none focus-visible:ring-1 focus-visible:ring-violet-500 sm:w-36 sm:text-sm md:w-48 lg:w-64 lg:text-base font-heading"
          />
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={handleUndo}
            disabled={!canUndo}
            className="hidden h-8 w-8 sm:flex"
            title="Undo (Ctrl+Z)"
          >
            <Undo2 className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={handleRedo}
            disabled={!canRedo}
            className="hidden h-8 w-8 sm:flex"
            title="Redo (Ctrl+Shift+Z)"
          >
            <Redo2 className="h-4 w-4" />
          </Button>
          <span
            className={cn(
              "hidden text-xs font-semibold tracking-wide uppercase sm:block px-2 py-1 rounded-md",
              savedState === "saved" ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10"
            )}
          >
            {savedState === "saved" ? "● Saved" : "● Unsaved"}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={openSwitchTemplate}
            className="hidden h-8 px-2 text-xs md:flex lg:px-3 lg:text-sm border-border/50 hover:bg-violet-500/10 hover:text-violet-600 transition-colors"
          >
            <LayoutTemplate className="h-3 w-3 lg:mr-1.5 lg:h-4 lg:w-4" />
            <span className="hidden lg:inline">Switch Template</span>
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={printPreview}
            className="hidden h-8 px-2 text-xs md:flex lg:px-3 lg:text-sm border-border/50 hover:bg-blue-500/10 hover:text-blue-600 transition-colors"
          >
            <Download className="h-3 w-3 lg:mr-1.5 lg:h-4 lg:w-4" />
            <span className="hidden lg:inline">Save as PDF</span>
          </Button>
          <Button
            onClick={saveWorkspace}
            disabled={isSaving}
            size="sm"
            className="h-8 bg-gradient-to-r from-violet-600 to-blue-600 px-3 text-xs text-white hover:shadow-md sm:px-4 lg:text-sm transition-all"
          >
            {isSaving ? (
              <CircleDashed className="h-3 w-3 animate-spin sm:mr-1" />
            ) : (
              <Save className="h-3 w-3 sm:mr-1.5" />
            )}
            <span className="hidden sm:inline font-medium">Save</span>
          </Button>
        </div>
      </header>

      {/* ── Mobile view tabs ── */}
      <div className="flex flex-shrink-0 border-b border-border/40 bg-secondary/30 backdrop-blur-md lg:hidden">
        {(["editor", "preview", "tools"] as MobileView[]).map((view) => (
          <button
            key={view}
            className={cn(
              "flex-1 py-2 text-center text-xs font-semibold capitalize transition-colors",
              mobileView === view
                ? "border-b-2 border-violet-500 text-violet-600 bg-violet-500/5"
                : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
            )}
            onClick={() => setMobileView(view)}
          >
            {view}
          </button>
        ))}
      </div>

      {/* ── Main layout ── */}
      <main className="relative min-h-0 flex-1 overflow-hidden lg:flex lg:flex-row">

        {/* LEFT SIDEBAR — sections list */}
        <aside
          className={cn(
            "flex-shrink-0 border-r border-border/40 bg-secondary/10 backdrop-blur-sm transition-all duration-300 overflow-hidden",
            "hidden lg:flex lg:flex-col",
            activeTool
              ? "lg:w-0 lg:border-r-0"
              : leftSidebarOpen
                ? "lg:w-[260px] xl:w-[288px]"
                : "lg:w-0 lg:border-r-0",
            mobileView === "editor" && "flex flex-col w-full absolute inset-0 z-10 lg:relative lg:inset-auto lg:z-auto bg-background"
          )}
        >
          {/* Sidebar header */}
          <div className="hidden h-14 flex-shrink-0 items-center gap-3 border-b border-border/40 px-4 lg:flex xl:h-16 xl:px-5">
            <div className="p-1.5 rounded-md bg-violet-500/10 text-violet-600 flex-shrink-0">
              <FileText className="h-4 w-4 xl:h-5 xl:w-5" />
            </div>
            <h2 className="truncate text-lg font-bold xl:text-xl font-heading text-foreground">Sections</h2>
            <Button
              variant="ghost"
              size="icon"
              className="ml-auto h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-secondary/80"
              onClick={() => setLeftSidebarOpen(false)}
              title="Collapse sidebar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </div>

          <ScrollArea className="min-h-0 flex-1">
            <nav className="py-3 px-2 space-y-1">
              {resume.sections.map((sectionId) => {
                const Icon = sectionMeta[sectionId].icon;
                const active = sectionId === activeSection;
                return (
                  <div
                    key={sectionId}
                    className={cn(
                      "group flex items-center gap-1 border-l-2 rounded-r-lg px-3 py-0.5 transition-colors",
                      active ? "border-violet-500 bg-violet-500/10 text-violet-700 font-medium" : "border-transparent text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
                    )}
                  >
                    {reorderMode && (
                      <div className="flex flex-col gap-0 mr-1 opacity-50 hover:opacity-100">
                        <button className="text-[10px] leading-tight hover:text-violet-600"
                          onClick={() => moveSection(sectionId, -1)}>▲</button>
                        <button className="text-[10px] leading-tight hover:text-violet-600"
                          onClick={() => moveSection(sectionId, 1)}>▼</button>
                      </div>
                    )}
                    <button
                      className="flex flex-1 items-center gap-3 py-2.5 text-left"
                      onClick={() => setActiveSection(sectionId)}
                    >
                      {reorderMode ? (
                        <GripVertical className="h-4 w-4 flex-shrink-0 opacity-50" />
                      ) : (
                        <Icon className={cn("h-4 w-4 flex-shrink-0 xl:h-5 xl:w-5 transition-colors", active ? "text-violet-600" : "text-muted-foreground group-hover:text-foreground")} />
                      )}
                      <span className={cn("truncate text-sm xl:text-base", active ? "font-bold text-violet-700" : "font-medium")}>
                        {sectionMeta[sectionId].label}
                      </span>
                    </button>
                    {removeMode ? (
                      sectionMeta[sectionId].locked ? (
                        <Lock className="h-4 w-4 flex-shrink-0 text-muted-foreground/30" />
                      ) : (
                        <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-red-500 hover:text-red-600 hover:bg-red-500/10"
                          onClick={() => removeSection(sectionId)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )
                    ) : (
                      <CheckCircle2 className={cn("h-4 w-4 flex-shrink-0 transition-all", active ? "text-violet-500 opacity-100" : "text-emerald-500 opacity-0 group-hover:opacity-50")} />
                    )}
                  </div>
                );
              })}
            </nav>
          </ScrollArea>

          <div className="flex-shrink-0 space-y-2 border-t border-border/40 p-4 bg-background/50">
            <Button variant="outline" className="h-9 w-full justify-center text-xs xl:h-10 xl:text-sm border-border/50 hover:bg-secondary font-medium transition-colors rounded-xl"
              onClick={() => setIsAddSectionOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Add Section
            </Button>
            <Button
              variant={removeMode ? "destructive" : "outline"}
              className={cn("h-9 w-full justify-center text-xs xl:h-10 xl:text-sm font-medium transition-colors rounded-xl", !removeMode && "border-border/50 hover:bg-secondary")}
              onClick={() => setRemoveMode((v) => !v)}
            >
              {removeMode ? "Done Removing" : "Remove Section"}
            </Button>
            <Button
              variant={reorderMode ? "default" : "outline"}
              className={cn("h-9 w-full justify-center text-xs xl:h-10 xl:text-sm font-medium transition-colors rounded-xl", 
                reorderMode ? "bg-violet-600 hover:bg-violet-700 text-white" : "border-border/50 hover:bg-secondary")}
              onClick={() => setReorderMode((v) => !v)}
            >
              {reorderMode ? "Done Reordering" : "Shuffle Layout"}
            </Button>
          </div>
        </aside>

        {/* Collapsed sidebar toggle — only when no tool open */}
        {!leftSidebarOpen && !activeTool && (
          <button
            onClick={() => setLeftSidebarOpen(true)}
            className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-r-xl border border-l-0 border-border/40 bg-secondary/80 backdrop-blur-md py-4 pl-1.5 pr-2.5 shadow-sm transition-all hover:bg-secondary hover:w-8 hover:pr-3 lg:flex group"
            title="Expand sidebar"
          >
            <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors" />
          </button>
        )}

        {/* ── EDITOR PANEL ── */}
        <section
          className={cn(
            "min-h-0 flex-shrink-0 border-r border-border/40 bg-card/50 backdrop-blur-sm transition-all duration-300",
            "hidden lg:block",
            // When tool open: editor takes fixed width, preview takes remaining
            activeTool
              ? "lg:w-[360px] xl:w-[400px]"
              : leftSidebarOpen
                ? "lg:w-[360px] xl:w-[420px]"
                : "lg:w-[480px] xl:w-[520px]",
            mobileView === "editor" && "block w-full"
          )}
        >
          {/* Mobile section picker bar */}
          <div className="flex overflow-x-auto border-b border-border/40 bg-secondary/30 backdrop-blur-md lg:hidden">
            {resume.sections.map((sectionId) => (
              <button
                key={sectionId}
                onClick={() => setActiveSection(sectionId)}
                className={cn(
                  "flex-shrink-0 px-4 py-2.5 text-xs font-semibold transition-colors",
                  activeSection === sectionId
                    ? "border-b-2 border-violet-500 bg-background text-violet-600"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                )}
              >
                {sectionMeta[sectionId].label}
              </button>
            ))}
          </div>

          <ScrollArea className="h-full">
            <div className="p-3 sm:p-4 md:p-5 xl:p-6">
              {/* Contextual Tip */}
              {!dismissedTips.has(activeSection) && (
                <div className="mb-4 flex items-start gap-2 rounded-lg border border-border bg-secondary p-3 text-xs text-foreground sm:text-sm">
                  <Lightbulb className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
                  <p className="flex-1">
                    {contextualTips[activeSection] || contextualTips.default}
                  </p>
                  <button
                    onClick={() =>
                      setDismissedTips((prev) => new Set(prev).add(activeSection))
                    }
                    className="flex-shrink-0 rounded p-0.5 hover:bg-primary/10"
                    title="Dismiss tip"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              )}
              {renderEditor()}
              <div className="mt-6 flex justify-between border-t border-border/40 pt-5">
                <Button variant="outline" size="icon" className="rounded-xl border-border/50 hover:bg-secondary transition-colors" onClick={() => goToSection(-1)} disabled={sectionIndex <= 0}>
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" className="rounded-xl border-border/50 hover:bg-secondary transition-colors" onClick={() => goToSection(1)} disabled={sectionIndex >= resume.sections.length - 1}>
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </ScrollArea>
        </section>

        {/* ── PREVIEW PANEL ── */}
        <section
          className={cn(
            "min-h-0 min-w-0 flex-1 overflow-auto bg-secondary/10 backdrop-blur-sm transition-all duration-300",
            "hidden lg:block",
            activeTool
              ? "p-3 lg:p-4 lg:pr-[394px] xl:pr-[434px]"
              : "p-3 sm:p-4 lg:p-6 xl:p-8",
            mobileView === "preview" && "block"
          )}
        >
          <div className="mx-auto">
            <div className="overflow-x-auto">
              <ResumePreview refEl={previewRef} resume={resume} accent={previewAccent} />
            </div>
          </div>
        </section>

        {/* ── TOOL ICON RAIL ── */}
        <aside
          className="hidden flex-shrink-0 flex-col items-center gap-4 border-l border-border/40 bg-secondary/10 backdrop-blur-md py-6 lg:flex"
          style={{ width: 74 }}
        >
          <Button
            variant={activeTool === "strength" ? "default" : "ghost"}
            size="icon"
            className={cn("h-11 w-11 rounded-xl transition-all", activeTool === "strength" ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20" : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600")}
            title="Resume strength"
            onClick={() => handleToolToggle("strength")}
          >
            <BarChart3 className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === "jd" ? "default" : "ghost"}
            size="icon"
            className={cn("h-11 w-11 rounded-xl transition-all", activeTool === "jd" ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20" : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600")}
            title="Match job description"
            onClick={() => handleToolToggle("jd")}
          >
            <WandSparkles className="h-5 w-5" />
          </Button>
          <Button
            variant={activeTool === "customize" ? "default" : "ghost"}
            size="icon"
            className={cn("h-11 w-11 rounded-xl transition-all", activeTool === "customize" ? "bg-violet-600 hover:bg-violet-700 text-white shadow-md shadow-violet-500/20" : "text-muted-foreground hover:bg-violet-500/10 hover:text-violet-600")}
            title="Customize"
            onClick={() => handleToolToggle("customize")}
          >
            <Settings className="h-5 w-5" />
          </Button>
        </aside>

        {/* ── DESKTOP TOOL PANEL ── */}
        {activeTool && (
          <aside
            className="absolute bottom-0 right-[74px] top-0 z-20 hidden w-[320px] xl:w-[360px] flex-shrink-0 overflow-hidden border-l border-border/40 bg-background/95 backdrop-blur-xl shadow-2xl lg:block animate-in slide-in-from-right-4 duration-300"
          >
            <ToolPanelContent
              activeTool={activeTool}
              resume={resume}
              strength={strength}
              onClose={() => {
                setActiveTool(null);
                setLeftSidebarOpen(true);
              }}
              onUpdate={updateResume}
              onLayoutChange={applyLayoutPreset}
            />
          </aside>
        )}

        {/* ── MOBILE TOOLS PANEL ── */}
        {mobileView === "tools" && (
          <div className="block w-full bg-background/95 backdrop-blur-md lg:hidden">
            <div className="flex flex-shrink-0 border-b border-border/40">
              {(["strength", "jd", "customize"] as const).map((tool) => (
                <button
                  key={tool}
                  className={cn(
                    "flex-1 py-3 text-center text-xs font-semibold capitalize transition-colors",
                    activeTool === tool
                      ? "border-b-2 border-violet-500 text-violet-600 bg-violet-500/5"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary/50"
                  )}
                  onClick={() => setActiveTool(activeTool === tool ? null : tool)}
                >
                  {tool === "jd" ? "Match JD" : tool}
                </button>
              ))}
            </div>
            {activeTool && (
              <div className="overflow-auto" style={{ maxHeight: "calc(100dvh - 200px)" }}>
                <ToolPanelContent
                  activeTool={activeTool}
                  resume={resume}
                  strength={strength}
                  onClose={() => setActiveTool(null)}
                  onUpdate={updateResume}
                  onLayoutChange={applyLayoutPreset}
                />
              </div>
            )}
          </div>
        )}
      </main>

      {/* ── Mobile bottom bar ── */}
      <div className="flex flex-shrink-0 items-center justify-around border-t border-border/40 bg-secondary/50 backdrop-blur-md py-2 lg:hidden">
        <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-medium hover:bg-violet-500/10 hover:text-violet-600 rounded-xl transition-colors" onClick={openSwitchTemplate}>
          <LayoutTemplate className="mr-2 h-4 w-4" /> Template
        </Button>
        <Button variant="ghost" size="sm" className="h-9 px-4 text-xs font-medium hover:bg-blue-500/10 hover:text-blue-600 rounded-xl transition-colors" onClick={printPreview}>
          <Download className="mr-2 h-4 w-4" /> Save PDF
        </Button>
        <span className={cn("text-xs font-semibold px-2 py-1 rounded-md", savedState === "saved" ? "text-emerald-600 bg-emerald-500/10" : "text-amber-600 bg-amber-500/10")}>
          {savedState === "saved" ? "● Saved" : "● Unsaved"}
        </span>
      </div>

      {/* ── Mobile floating action bar ── */}
      <div className="fixed inset-x-3 bottom-20 z-30 mx-auto flex max-w-md items-center justify-between gap-2 rounded-full border border-slate-200 bg-white/95 px-3 py-2 shadow-lg backdrop-blur sm:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo"
          aria-label="Undo"
        >
          <Undo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo"
          aria-label="Redo"
        >
          <Redo2 className="h-4 w-4" />
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="h-9 px-3"
          onClick={() => setMobileView("preview")}
          aria-pressed={mobileView === "preview"}
        >
          <FileText className="mr-1 h-4 w-4" /> Preview
        </Button>
        <Button
          size="sm"
          className="h-9 bg-emerald-400 px-4 text-gray-950 hover:bg-emerald-500"
          onClick={saveWorkspace}
          disabled={isSaving}
        >
          {isSaving ? (
            <CircleDashed className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          <span className="ml-1 text-xs font-semibold">Save</span>
        </Button>
      </div>

      {/* Hidden file input */}
      <input
        ref={uploadInputRef}
        type="file"
        accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        className="hidden"
        onChange={handleUploadSelected}
      />

      {/* ── Template Dialog ── */}
      <TemplateDialog
        open={templateDialogOpen}
        onOpenChange={(open) => {
          setTemplateDialogOpen(open);
          if (!open) setIsSwitchingTemplate(false);
        }}
        selectedTemplate={resume.templateId}
        accent={previewAccent}
        onSelect={handleTemplateSelect}
      />

      {/* ── Start Dialog ── */}
      <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
        <DialogContent className="flex items-center justify-center border-0 bg-transparent p-3 shadow-none sm:p-4">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-[clamp(1.25rem,4vw,2rem)]">
            <div className="mb-[clamp(0.75rem,2vw,1rem)] flex flex-col items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
              <div
                className="flex items-center justify-center rounded-[clamp(12px,3vw,18px)] bg-primary text-primary-foreground"
                style={{ width: "clamp(48px,10vw,64px)", height: "clamp(48px,10vw,64px)" }}
              >
                <FileText style={{ width: "clamp(22px,5vw,30px)", height: "clamp(22px,5vw,30px)" }} />
              </div>
              <DialogHeader>
                <DialogTitle
                  className="text-center font-medium text-foreground"
                  style={{ fontSize: "clamp(1.1rem,4vw,1.6rem)", lineHeight: 1.2 }}
                >
                  Let's build your resume
                </DialogTitle>
              </DialogHeader>
              <p
                className="mx-auto max-w-sm text-center text-muted-foreground"
                style={{ fontSize: "clamp(0.75rem,2.5vw,0.95rem)", lineHeight: 1.5 }}
              >
                Start fresh with a blank editor, or upload an existing resume and let AI fill it in for you.
              </p>
            </div>
            <div className="flex flex-col gap-[clamp(0.5rem,2vw,0.75rem)]">
              <button
                className="flex w-full items-center gap-[clamp(10px,3vw,16px)] rounded-xl border-2 border-primary bg-secondary text-left transition-colors hover:bg-secondary/80"
                style={{ padding: "clamp(0.75rem,3vw,1.1rem) clamp(0.875rem,3vw,1.25rem)" }}
                onClick={() => { setStartDialogOpen(false); setUploadDialogOpen(true); }}
              >
                <div
                  className="flex shrink-0 items-center justify-center rounded-lg bg-primary/10"
                  style={{ width: "clamp(36px,8vw,48px)", height: "clamp(36px,8vw,48px)" }}
                >
                  <Upload className="text-primary" style={{ width: "clamp(18px,4vw,24px)", height: "clamp(18px,4vw,24px)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground" style={{ fontSize: "clamp(0.85rem,3vw,1rem)", marginBottom: 2 }}>
                    Upload existing resume
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "clamp(0.7rem,2.2vw,0.82rem)", lineHeight: 1.4 }}>
                    Upload a PDF or Word doc — AI will parse and prefill the editor
                  </div>
                </div>
                <ArrowRight className="shrink-0 text-primary" style={{ width: 16, height: 16 }} />
              </button>

              <button
                className="flex w-full items-center gap-[clamp(10px,3vw,16px)] rounded-xl border border-border bg-card text-left transition-colors hover:bg-secondary"
                style={{ padding: "clamp(0.75rem,3vw,1.1rem) clamp(0.875rem,3vw,1.25rem)" }}
                onClick={startFromScratch}
              >
                <div
                  className="flex shrink-0 items-center justify-center rounded-lg bg-secondary"
                  style={{ width: "clamp(36px,8vw,48px)", height: "clamp(36px,8vw,48px)" }}
                >
                  <FileText className="text-muted-foreground" style={{ width: "clamp(18px,4vw,24px)", height: "clamp(18px,4vw,24px)" }} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-medium text-foreground" style={{ fontSize: "clamp(0.85rem,3vw,1rem)", marginBottom: 2 }}>
                    Start from scratch
                  </div>
                  <div className="text-muted-foreground" style={{ fontSize: "clamp(0.7rem,2.2vw,0.82rem)", lineHeight: 1.4 }}>
                    Blank editor — build your resume section by section
                  </div>
                </div>
                <ArrowRight className="shrink-0 text-muted-foreground" style={{ width: 16, height: 16 }} />
              </button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ── Upload Dialog ── */}
      <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
        <DialogContent className="mx-2 w-[calc(100vw-1rem)] max-w-2xl rounded-2xl p-4 sm:p-6 md:p-8 bg-card">
          <div className="mb-4 flex items-center gap-2 sm:mb-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => { setUploadDialogOpen(false); setStartDialogOpen(true); }}
              className="h-8 px-2 text-xs sm:text-sm"
            >
              <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Back
            </Button>
            <DialogTitle className="text-base font-bold sm:text-lg md:text-xl text-foreground">
              Upload Your Resume
            </DialogTitle>
          </div>
          <button
            className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:border-primary hover:bg-secondary sm:p-10 md:p-14"
            onClick={chooseUploadFile}
            disabled={isParsingUpload}
          >
            <Upload className="mb-3 h-10 w-10 rounded-xl bg-primary/10 p-2 text-primary sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl sm:p-3" />
            <div className="text-sm font-bold sm:text-lg md:text-xl text-foreground">Drag & drop your resume here</div>
            <div className="mt-1 text-xs text-muted-foreground sm:mt-2 sm:text-sm">or click to browse files</div>
            <div className="mt-3 flex gap-2 text-xs font-semibold text-muted-foreground sm:mt-4">
              <span className="rounded bg-secondary px-2 py-1">PDF</span>
              <span className="rounded bg-secondary px-2 py-1">DOCX</span>
              <span className="rounded bg-secondary px-2 py-1">Max 5MB</span>
            </div>
            <span className="mt-4 rounded-lg bg-primary px-5 py-2 text-xs font-bold text-primary-foreground sm:mt-6 sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm">
              Choose File
            </span>
          </button>
        </DialogContent>
      </Dialog>

      {/* ── Analyzing Dialog ── */}
      <Dialog open={analyzingDialogOpen} onOpenChange={() => undefined}>
        <DialogContent className="mx-2 w-[calc(100vw-1rem)] max-w-lg rounded-2xl p-6 sm:p-8 md:p-10 bg-card">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-secondary ring-2 ring-primary/20 sm:mb-6 sm:h-20 sm:w-20 sm:ring-4">
            <CircleDashed className="h-7 w-7 animate-spin text-primary sm:h-10 sm:w-10" />
          </div>
          <DialogHeader>
            <DialogTitle className="text-center text-lg font-bold sm:text-xl md:text-2xl text-foreground">
              Analyzing your resume…
            </DialogTitle>
          </DialogHeader>
          <p className="mt-1 text-center text-xs text-muted-foreground sm:text-sm">
            Our AI is reading and structuring your data
          </p>
          <div className="mx-auto mt-5 w-full max-w-sm space-y-3 sm:mt-7 sm:space-y-4">
            {[
              "Extracting text from your resume",
              "Analyzing your experience & skills",
              "Structuring your data",
              "Prefilling your resume editor",
            ].map((label, index) => (
              <div
                key={label}
                className={cn(
                  "flex items-center gap-3 text-xs sm:text-sm",
                  analysisStep >= index ? "text-primary" : "text-muted-foreground"
                )}
              >
                {analysisStep > index ? (
                  <CheckCircle2 className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
                ) : analysisStep === index ? (
                  <CircleDashed className="h-5 w-5 flex-shrink-0 animate-spin text-primary sm:h-6 sm:w-6" />
                ) : (
                  <span className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-border sm:h-6 sm:w-6" />
                )}
                <span className={analysisStep === index ? "font-bold text-foreground" : ""}>
                  {label}
                </span>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>

{/* ── Add Section Dialog ── */}
<Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
  <DialogContent className="mx-2 w-[calc(100vw-1rem)] max-w-xl rounded-2xl p-4 sm:p-6 max-h-[90dvh] flex flex-col bg-card">
    <DialogHeader className="flex-shrink-0">
      <DialogTitle className="text-base font-bold sm:text-xl text-foreground">Add a Section</DialogTitle>
    </DialogHeader>
    <div className="overflow-y-auto flex-1 min-h-0">
      <div className="grid grid-cols-2 gap-2 py-3 sm:gap-3 sm:py-4 md:grid-cols-3">
        {addableSections.map((sectionId) => {
          const Icon = sectionMeta[sectionId].icon;
          const added = resume.sections.includes(sectionId);
          return (
            <button
              key={sectionId}
              disabled={added}
              className={cn(
                "flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border border-border p-3 text-center transition-colors sm:min-h-[88px] sm:gap-2.5 sm:p-4",
                added
                  ? "bg-secondary text-muted-foreground/50"
                  : "hover:border-primary hover:bg-secondary"
              )}
              onClick={() => addSection(sectionId)}
            >
              <span className={cn("rounded-full p-2", added ? "bg-secondary text-muted-foreground/50" : "bg-primary/10 text-primary")}>
                <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
              </span>
              <span className="text-xs font-semibold leading-tight sm:text-sm text-foreground">
                {sectionMeta[sectionId].label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  </DialogContent>
</Dialog>
    </div>
  );
};

export default ResumeBuilder;

// import { useEffect, useMemo, useRef, useState } from "react";
// import type React from "react";
// import { useSearchParams } from "react-router-dom";
// import {
//   ArrowLeft,
//   ArrowRight,
//   BarChart3,
//   BriefcaseBusiness,
//   CheckCircle2,
//   CircleDashed,
//   Download,
//   FileText,
//   GripVertical,
//   LayoutTemplate,
//   Lock,
//   Plus,
//   Save,
//   Settings,
//   Trash2,
//   Upload,
//   WandSparkles,
// } from "lucide-react";
// import { useResumeHistory } from "@/hooks/useResumeHistory";
// import { toast } from "sonner";
// import apiClient from "@/lib/api";
// import { Button } from "@/components/ui/button";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";
// import { ScrollArea } from "@/components/ui/scroll-area";
// import { Textarea } from "@/components/ui/textarea";
// import { cn } from "@/lib/utils";
// import {
//   addableSections,
//   calculateStrength,
//   createInitialWorkspace,
//   EditorShell,
//   EntryList,
//   Field,
//   getPresetAccent,
//   isSectionId,
//   isTemplateId,
//   layoutPresets,
//   requiredSections,
//   ResumePreview,
//   sectionMeta,
//   TemplateDialog,
//   ToolPanelContent,
// } from "@/components/resume-builder";
// import type {
//   ApiErrorLike,
//   LayoutPreset,
//   MobileView,
//   ResumeWorkspace,
//   SectionId,
//   TemplateId,
//   ToolPanel,
// } from "@/components/resume-builder";

// const normalizeWorkspace = (
//   workspaceData: Partial<ResumeWorkspace>,
//   fallbackTitle = "Untitled Resume",
//   currentTemplateId: TemplateId = "modern"
// ): ResumeWorkspace => {
//   const base = createInitialWorkspace(
//     isTemplateId(workspaceData.templateId) ? workspaceData.templateId : currentTemplateId
//   );
//   const next: ResumeWorkspace = {
//     ...base,
//     ...workspaceData,
//     title: workspaceData.title || fallbackTitle,
//     templateId: isTemplateId(workspaceData.templateId)
//       ? workspaceData.templateId
//       : base.templateId,
//     customization: { ...base.customization, ...(workspaceData.customization || {}) },
//     personal: { ...base.personal, ...(workspaceData.personal || {}) },
//     experience:
//       Array.isArray(workspaceData.experience) && workspaceData.experience.length
//         ? workspaceData.experience
//         : base.experience,
//     education:
//       Array.isArray(workspaceData.education) && workspaceData.education.length
//         ? workspaceData.education
//         : base.education,
//     skills:
//       Array.isArray(workspaceData.skills) && workspaceData.skills.length
//         ? workspaceData.skills
//         : base.skills,
//     projects: Array.isArray(workspaceData.projects) ? workspaceData.projects : [],
//     certifications: Array.isArray(workspaceData.certifications)
//       ? workspaceData.certifications
//       : [],
//     extras: workspaceData.extras || {},
//     sections: Array.isArray(workspaceData.sections)
//       ? workspaceData.sections.filter(isSectionId)
//       : base.sections,
//   };

//   next.sections = Array.from(new Set(["personal", ...next.sections]));
//   for (const requiredSection of requiredSections) {
//     if (!next.sections.includes(requiredSection)) next.sections.push(requiredSection);
//   }
//   if (next.projects.length > 0 && !next.sections.includes("projects"))
//     next.sections.push("projects");
//   if (next.certifications.length > 0 && !next.sections.includes("certifications"))
//     next.sections.push("certifications");

//   return next;
// };

// const ResumeBuilder = () => {
//   const [searchParams, setSearchParams] = useSearchParams();
//   const initialResumeId = searchParams.get("id");
//   const [resumeId, setResumeId] = useState<string | null>(initialResumeId);
//   const [resume, setResume] = useState<ResumeWorkspace>(() => createInitialWorkspace());
//   const [activeSection, setActiveSection] = useState<SectionId>("personal");
//   const [activeTool, setActiveTool] = useState<ToolPanel>(null);
//   const [templateDialogOpen, setTemplateDialogOpen] = useState(!initialResumeId);
//   const [startDialogOpen, setStartDialogOpen] = useState(false);
//   const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
//   const [analyzingDialogOpen, setAnalyzingDialogOpen] = useState(false);
//   const [isSwitchingTemplate, setIsSwitchingTemplate] = useState(false);
//   const [isAddSectionOpen, setIsAddSectionOpen] = useState(false);
//   const [removeMode, setRemoveMode] = useState(false);
//   const [reorderMode, setReorderMode] = useState(false);
//   const [isSaving, setIsSaving] = useState(false);
//   const [isAssisting, setIsAssisting] = useState(false);
//   const [isParsingUpload, setIsParsingUpload] = useState(false);
//   const [analysisStep, setAnalysisStep] = useState(0);
//   const [savedState, setSavedState] = useState<"saved" | "unsaved">("unsaved");
//   const [mobileView, setMobileView] = useState<MobileView>("editor");
//   // NEW: left sidebar visibility on desktop
//   const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
//   const previewRef = useRef<HTMLDivElement>(null);
//   const uploadInputRef = useRef<HTMLInputElement>(null);

//   const { pushState } = useResumeHistory(resume);

//   const strength = useMemo(() => calculateStrength(resume), [resume]);
//   const previewAccent =
//     resume.customization.accentColor || getPresetAccent(resume.stylePreset);

//   const resumeRef = useRef(resume);
//   resumeRef.current = resume;
//   useEffect(() => {
//     const timer = setTimeout(() => {
//       pushState(resumeRef.current);
//     }, 500);
//     return () => clearTimeout(timer);
//   }, [resume, pushState]);

//   useEffect(() => {
//     const currentId = searchParams.get("id");
//     if (!currentId) return;

//     let cancelled = false;
//     const loadWorkspace = async () => {
//       try {
//         const response = await apiClient.get(`/api/builder/workspace/${currentId}`);
//         if (cancelled) return;
//         setResume(
//           normalizeWorkspace(
//             response.data.workspaceData as Partial<ResumeWorkspace>,
//             "Untitled Resume",
//             resume.templateId
//           )
//         );
//         setResumeId(currentId);
//         setSavedState("saved");
//         setTemplateDialogOpen(false);
//         setStartDialogOpen(false);
//         setUploadDialogOpen(false);
//         setAnalyzingDialogOpen(false);
//       } catch (error: unknown) {
//         const apiError = error as ApiErrorLike;
//         toast.error(apiError.response?.data?.message || "Could not load saved resume");
//       }
//     };

//     loadWorkspace();
//     return () => { cancelled = true; };
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [searchParams]);

//   const updateResume = (updater: (current: ResumeWorkspace) => ResumeWorkspace) => {
//     setSavedState("unsaved");
//     setResume((current) => updater(structuredClone(current)));
//   };

//   const handleTemplateSelect = (templateId: TemplateId) => {
//     updateResume((draft) => {
//       draft.templateId = templateId;
//       return draft;
//     });
//     setTemplateDialogOpen(false);
//     if (isSwitchingTemplate || resumeId) {
//       setIsSwitchingTemplate(false);
//       return;
//     }
//     setStartDialogOpen(true);
//   };

//   const startFromScratch = () => {
//     const blank = createInitialWorkspace(resume.templateId);
//     setResume(blank);
//     setResumeId(null);
//     setSearchParams({});
//     setActiveSection("personal");
//     setStartDialogOpen(false);
//     setSavedState("unsaved");
//   };

//   const openSwitchTemplate = () => {
//     setIsSwitchingTemplate(true);
//     setTemplateDialogOpen(true);
//   };

//   const chooseUploadFile = () => {
//     uploadInputRef.current?.click();
//   };

//   // NEW: toggle tool with left sidebar auto-close
//   const handleToolToggle = (tool: ToolPanel) => {
//     if (activeTool === tool) {
//       setActiveTool(null);
//       // Restore left sidebar when tool closes
//       setLeftSidebarOpen(true);
//     } else {
//       setActiveTool(tool);
//       // Auto-close left sidebar when tool opens
//       setLeftSidebarOpen(false);
//     }
//   };

//   const handleUploadSelected = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     const file = event.target.files?.[0];
//     event.target.value = "";
//     if (!file) return;

//     if (file.size > 5 * 1024 * 1024) {
//       toast.error("Please upload a file smaller than 5MB.");
//       return;
//     }

//     setUploadDialogOpen(false);
//     setAnalyzingDialogOpen(true);
//     setIsParsingUpload(true);
//     setAnalysisStep(0);

//     const timer = window.setInterval(() => {
//       setAnalysisStep((step) => Math.min(step + 1, 2));
//     }, 1000);

//     try {
//       const formData = new FormData();
//       formData.append("resumeFile", file);

//       const response = await apiClient.post("/api/builder/parse-upload", formData, {
//         headers: { "Content-Type": "multipart/form-data" },
//       });

//       window.clearInterval(timer);
//       setAnalysisStep(3);

//       const parsedWorkspace = normalizeWorkspace(
//         {
//           ...(response.data.workspaceData as Partial<ResumeWorkspace>),
//           templateId: resume.templateId,
//         },
//         file.name.replace(/\.[^.]+$/, "") || "Imported Resume",
//         resume.templateId
//       );

//       window.setTimeout(() => {
//         setResume(parsedWorkspace);
//         setResumeId(null);
//         setSearchParams({});
//         setActiveSection("personal");
//         setAnalyzingDialogOpen(false);
//         setSavedState("unsaved");
//         toast.success("Resume imported. Review the fields before saving.");
//       }, 500);
//     } catch (error: unknown) {
//       window.clearInterval(timer);
//       setAnalyzingDialogOpen(false);
//       setUploadDialogOpen(true);
//       const apiError = error as ApiErrorLike;
//       toast.error(apiError.response?.data?.message || "Could not import this resume");
//     } finally {
//       setIsParsingUpload(false);
//     }
//   };

//   const saveWorkspace = async () => {
//     setIsSaving(true);
//     try {
//       const response = await apiClient.post("/api/builder/workspace", {
//         resumeId,
//         title: resume.title,
//         workspaceData: resume,
//       });
//       const nextId = response.data?.resumeId as string | undefined;
//       if (nextId && nextId !== resumeId) {
//         setResumeId(nextId);
//         setSearchParams({ id: nextId });
//       }
//       setSavedState("saved");
//       toast.success(response.data?.message || "Resume saved");
//     } catch (error: unknown) {
//       const apiError = error as ApiErrorLike;
//       toast.error(apiError.response?.data?.message || "Could not save resume");
//     } finally {
//       setIsSaving(false);
//     }
//   };

//   const printPreview = () => {
//     const content = previewRef.current?.innerHTML;
//     if (!content) {
//       toast.error("Preview is not ready yet");
//       return;
//     }
//     const printWindow = window.open("", "_blank", "width=900,height=1100");
//     if (!printWindow) {
//       toast.error("Please allow popups to export PDF");
//       return;
//     }
//     printWindow.document.write(`
//       <html>
//         <head>
//           <title>${resume.title}</title>
//           <style>
//             body { margin: 0; background: #fff; font-family: Arial, sans-serif; }
//             .print-page { width: 794px; min-height: 1123px; margin: 0 auto; box-shadow: none !important; }
//           </style>
//         </head>
//         <body>${content}</body>
//       </html>
//     `);
//     printWindow.document.close();
//     printWindow.focus();
//     printWindow.print();
//   };

//   const aiAssist = async (
//     fieldType: string,
//     currentText: string,
//     apply: (suggestion: string) => void
//   ) => {
//     setIsAssisting(true);
//     try {
//       const response = await apiClient.post("/api/builder/assist", {
//         fieldType,
//         currentText,
//         context: `${resume.personal.headline}\n${resume.targetJobDescription}`,
//       });
//       apply(response.data.suggestion || "");
//       setSavedState("unsaved");
//       toast.success("AI suggestion applied");
//     } catch (error: unknown) {
//       const apiError = error as ApiErrorLike;
//       toast.error(apiError.response?.data?.message || "AI assist failed");
//     } finally {
//       setIsAssisting(false);
//     }
//   };

//   const addSection = (sectionId: SectionId) => {
//     updateResume((draft) => {
//       if (!draft.sections.includes(sectionId)) draft.sections.push(sectionId);
//       if (
//         !draft.extras[sectionId] &&
//         !requiredSections.includes(sectionId) &&
//         sectionId !== "projects" &&
//         sectionId !== "certifications"
//       ) {
//         draft.extras[sectionId] = {
//           id: sectionId,
//           title: sectionMeta[sectionId].label,
//           content: "",
//         };
//       }
//       if (sectionId === "projects" && draft.projects.length === 0) {
//         draft.projects.push({ name: "", role: "", technologies: "", link: "", description: "" });
//       }
//       if (sectionId === "certifications" && draft.certifications.length === 0) {
//         draft.certifications.push({ name: "", issuer: "", date: "" });
//       }
//       return draft;
//     });
//     setActiveSection(sectionId);
//     setIsAddSectionOpen(false);
//   };

//   const removeSection = (sectionId: SectionId) => {
//     if (sectionMeta[sectionId].locked) return;
//     updateResume((draft) => {
//       draft.sections = draft.sections.filter((id) => id !== sectionId);
//       if (draft.extras[sectionId]) delete draft.extras[sectionId];
//       return draft;
//     });
//     setActiveSection("personal");
//   };

//   const moveSection = (sectionId: SectionId, direction: -1 | 1) => {
//     updateResume((draft) => {
//       const index = draft.sections.indexOf(sectionId);
//       const nextIndex = index + direction;
//       if (index < 0 || nextIndex < 0 || nextIndex >= draft.sections.length) return draft;
//       const [item] = draft.sections.splice(index, 1);
//       draft.sections.splice(nextIndex, 0, item);
//       return draft;
//     });
//   };

//   const applyLayoutPreset = (layoutPreset: LayoutPreset) => {
//     const preset = layoutPresets.find((item) => item.id === layoutPreset);
//     if (!preset) return;
//     updateResume((draft) => {
//       const existingExtras = draft.sections.filter((section) => !preset.order.includes(section));
//       draft.layoutPreset = layoutPreset;
//       draft.sections = [...preset.order, ...existingExtras];
//       return draft;
//     });
//   };

//   const sectionIndex = resume.sections.indexOf(activeSection);
//   const goToSection = (direction: -1 | 1) => {
//     const next = resume.sections[sectionIndex + direction];
//     if (next) setActiveSection(next);
//   };

//   const renderEditor = () => {
//     switch (activeSection) {
//       case "personal":
//         return (
//           <EditorShell title="Personal Info">
//             <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
//               <Field label="Full Name">
//                 <Input
//                   value={resume.personal.name}
//                   onChange={(e) =>
//                     updateResume((draft) => { draft.personal.name = e.target.value; return draft; })
//                   }
//                 />
//               </Field>
//               <Field label="Professional Headline">
//                 <Input
//                   value={resume.personal.headline}
//                   onChange={(e) =>
//                     updateResume((draft) => { draft.personal.headline = e.target.value; return draft; })
//                   }
//                 />
//               </Field>
//               <Field label="Email Address">
//                 <Input
//                   value={resume.personal.email}
//                   onChange={(e) =>
//                     updateResume((draft) => { draft.personal.email = e.target.value; return draft; })
//                   }
//                 />
//               </Field>
//               <Field label="Phone Number">
//                 <Input
//                   value={resume.personal.phone}
//                   onChange={(e) =>
//                     updateResume((draft) => { draft.personal.phone = e.target.value; return draft; })
//                   }
//                 />
//               </Field>
//               <Field label="Location (City, State)" className="md:col-span-2">
//                 <Input
//                   value={resume.personal.location}
//                   onChange={(e) =>
//                     updateResume((draft) => { draft.personal.location = e.target.value; return draft; })
//                   }
//                 />
//               </Field>
//             </div>
//             <div className="pt-3">
//               <div className="mb-2 text-xs font-bold uppercase tracking-wide text-gray-500 sm:mb-3">
//                 Social & Web Links
//               </div>
//               {resume.personal.links.map((link, index) => (
//                 <div key={index} className="mb-2 flex gap-2">
//                   <Input
//                     value={link}
//                     onChange={(e) =>
//                       updateResume((draft) => { draft.personal.links[index] = e.target.value; return draft; })
//                     }
//                     placeholder="linkedin.com/in/name"
//                   />
//                   <Button
//                     variant="ghost"
//                     size="icon"
//                     onClick={() =>
//                       updateResume((draft) => { draft.personal.links.splice(index, 1); return draft; })
//                     }
//                   >
//                     <Trash2 className="h-4 w-4" />
//                   </Button>
//                 </div>
//               ))}
//               <Button
//                 variant="ghost"
//                 onClick={() =>
//                   updateResume((draft) => { draft.personal.links.push(""); return draft; })
//                 }
//                 className="text-sm"
//               >
//                 <Plus className="mr-1 h-4 w-4" /> Add Link
//               </Button>
//             </div>
//           </EditorShell>
//         );

//       case "summary":
//         return (
//           <EditorShell
//             title="Summary"
//             onAssist={() =>
//               aiAssist("professional summary", resume.summary, (s) =>
//                 updateResume((draft) => { draft.summary = s; return draft; })
//               )
//             }
//             isAssisting={isAssisting}
//           >
//             <Field label="Professional Summary">
//               <Textarea
//                 value={resume.summary}
//                 onChange={(e) =>
//                   updateResume((draft) => { draft.summary = e.target.value; return draft; })
//                 }
//                 rows={8}
//                 placeholder="Results-driven professional with..."
//               />
//             </Field>
//             <p className="text-xs text-gray-500 sm:text-sm">
//               2–4 sentences. Lead with your role, years of experience, and biggest strength.
//             </p>
//           </EditorShell>
//         );

//       case "experience":
//         return (
//           <EditorShell title="Work Experience">
//             <EntryList
//               items={resume.experience}
//               label="Work Experience"
//               addLabel="Add Position"
//               onAdd={() =>
//                 updateResume((draft) => {
//                   draft.experience.push({ jobTitle: "", company: "", employmentType: "", location: "", dates: "", description: "" });
//                   return draft;
//                 })
//               }
//               onRemove={(i) =>
//                 updateResume((draft) => { draft.experience.splice(i, 1); return draft; })
//               }
//               render={(item, i) => (
//                 <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
//                   <Field label="Job Title">
//                     <Input value={item.jobTitle} onChange={(e) => updateResume((d) => { d.experience[i].jobTitle = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Company">
//                     <Input value={item.company} onChange={(e) => updateResume((d) => { d.experience[i].company = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Employment Type">
//                     <Input value={item.employmentType} onChange={(e) => updateResume((d) => { d.experience[i].employmentType = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Location">
//                     <Input value={item.location} onChange={(e) => updateResume((d) => { d.experience[i].location = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Dates">
//                     <Input value={item.dates} onChange={(e) => updateResume((d) => { d.experience[i].dates = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Description" className="md:col-span-2">
//                     <div className="mb-2 flex justify-end">
//                       <Button size="sm" variant="outline" disabled={isAssisting}
//                         onClick={() => aiAssist("work experience bullet points", item.description, (s) => updateResume((d) => { d.experience[i].description = s; return d; }))}>
//                         <WandSparkles className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
//                         <span className="text-xs sm:text-sm">AI Assist</span>
//                       </Button>
//                     </div>
//                     <Textarea value={item.description} rows={7} onChange={(e) => updateResume((d) => { d.experience[i].description = e.target.value; return d; })} />
//                   </Field>
//                 </div>
//               )}
//             />
//           </EditorShell>
//         );

//       case "education":
//         return (
//           <EditorShell title="Education">
//             <EntryList
//               items={resume.education}
//               label="Education"
//               addLabel="Add Qualification"
//               onAdd={() =>
//                 updateResume((draft) => {
//                   draft.education.push({ degree: "", institution: "", honors: "", dates: "", gpa: "", description: "" });
//                   return draft;
//                 })
//               }
//               onRemove={(i) =>
//                 updateResume((draft) => { draft.education.splice(i, 1); return draft; })
//               }
//               render={(item, i) => (
//                 <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
//                   <Field label="Degree & Major">
//                     <Input value={item.degree} onChange={(e) => updateResume((d) => { d.education[i].degree = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Institution">
//                     <Input value={item.institution} onChange={(e) => updateResume((d) => { d.education[i].institution = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Honors / Minor">
//                     <Input value={item.honors} onChange={(e) => updateResume((d) => { d.education[i].honors = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Dates">
//                     <Input value={item.dates} onChange={(e) => updateResume((d) => { d.education[i].dates = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="GPA">
//                     <Input value={item.gpa} onChange={(e) => updateResume((d) => { d.education[i].gpa = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Description" className="md:col-span-2">
//                     <Textarea value={item.description} rows={5} onChange={(e) => updateResume((d) => { d.education[i].description = e.target.value; return d; })} />
//                   </Field>
//                 </div>
//               )}
//             />
//           </EditorShell>
//         );

//       case "skills":
//         return (
//           <EditorShell title="Skills">
//             <EntryList
//               items={resume.skills}
//               label="Skills"
//               addLabel="Add Skill Category"
//               onAdd={() =>
//                 updateResume((draft) => { draft.skills.push({ category: "", items: "" }); return draft; })
//               }
//               onRemove={(i) =>
//                 updateResume((draft) => { draft.skills.splice(i, 1); return draft; })
//               }
//               render={(item, i) => (
//                 <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
//                   <Field label="Category">
//                     <Input value={item.category} onChange={(e) => updateResume((d) => { d.skills[i].category = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Skills (comma separated)">
//                     <Input value={item.items} onChange={(e) => updateResume((d) => { d.skills[i].items = e.target.value; return d; })} />
//                   </Field>
//                 </div>
//               )}
//             />
//           </EditorShell>
//         );

//       case "projects":
//         return (
//           <EditorShell title="Projects">
//             <EntryList
//               items={resume.projects}
//               label="Projects"
//               addLabel="Add Project"
//               onAdd={() =>
//                 updateResume((draft) => { draft.projects.push({ name: "", role: "", technologies: "", link: "", description: "" }); return draft; })
//               }
//               onRemove={(i) =>
//                 updateResume((draft) => { draft.projects.splice(i, 1); return draft; })
//               }
//               render={(item, i) => (
//                 <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
//                   <Field label="Project Name">
//                     <Input value={item.name} onChange={(e) => updateResume((d) => { d.projects[i].name = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Role">
//                     <Input value={item.role} onChange={(e) => updateResume((d) => { d.projects[i].role = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Tech Stack">
//                     <Input value={item.technologies} onChange={(e) => updateResume((d) => { d.projects[i].technologies = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Link">
//                     <Input value={item.link} onChange={(e) => updateResume((d) => { d.projects[i].link = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Description" className="md:col-span-2">
//                     <div className="mb-2 flex justify-end">
//                       <Button size="sm" variant="outline" disabled={isAssisting}
//                         onClick={() => aiAssist("project description", item.description, (s) => updateResume((d) => { d.projects[i].description = s; return d; }))}>
//                         <WandSparkles className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
//                         <span className="text-xs sm:text-sm">AI Assist</span>
//                       </Button>
//                     </div>
//                     <Textarea value={item.description} rows={6} onChange={(e) => updateResume((d) => { d.projects[i].description = e.target.value; return d; })} />
//                   </Field>
//                 </div>
//               )}
//             />
//           </EditorShell>
//         );

//       case "certifications":
//         return (
//           <EditorShell title="Certifications">
//             <EntryList
//               items={resume.certifications}
//               label="Certifications"
//               addLabel="Add Certification"
//               onAdd={() =>
//                 updateResume((draft) => { draft.certifications.push({ name: "", issuer: "", date: "" }); return draft; })
//               }
//               onRemove={(i) =>
//                 updateResume((draft) => { draft.certifications.splice(i, 1); return draft; })
//               }
//               render={(item, i) => (
//                 <div className="grid grid-cols-1 gap-3 sm:gap-4 md:grid-cols-2">
//                   <Field label="Certification Name">
//                     <Input value={item.name} onChange={(e) => updateResume((d) => { d.certifications[i].name = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Issuing Organization">
//                     <Input value={item.issuer} onChange={(e) => updateResume((d) => { d.certifications[i].issuer = e.target.value; return d; })} />
//                   </Field>
//                   <Field label="Date Obtained">
//                     <Input value={item.date} onChange={(e) => updateResume((d) => { d.certifications[i].date = e.target.value; return d; })} />
//                   </Field>
//                 </div>
//               )}
//             />
//           </EditorShell>
//         );

//       default: {
//         const extra = resume.extras[activeSection] || {
//           id: activeSection,
//           title: sectionMeta[activeSection].label,
//           content: "",
//         };
//         return (
//           <EditorShell title={extra.title}>
//             <Field label="Section Title">
//               <Input
//                 value={extra.title}
//                 onChange={(e) =>
//                   updateResume((draft) => { draft.extras[activeSection] = { ...extra, title: e.target.value }; return draft; })
//                 }
//               />
//             </Field>
//             <Field label="Content">
//               <Textarea
//                 value={extra.content}
//                 rows={10}
//                 onChange={(e) =>
//                   updateResume((draft) => { draft.extras[activeSection] = { ...extra, content: e.target.value }; return draft; })
//                 }
//               />
//             </Field>
//           </EditorShell>
//         );
//       }
//     }
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex flex-col bg-gray-100 text-gray-950">

//       {/* ── Header ── */}
//       <header className="flex h-12 flex-shrink-0 items-center justify-between border-b bg-white px-2 shadow-sm sm:h-14 sm:px-3 md:h-[60px] md:px-4 lg:h-[68px] lg:px-5">
//         <div className="flex min-w-0 items-center gap-1 sm:gap-2 md:gap-3">
//           <Button
//             variant="ghost"
//             size="icon"
//             onClick={() => window.history.back()}
//             className="h-8 w-8 flex-shrink-0 sm:h-9 sm:w-9"
//           >
//             <ArrowLeft className="h-4 w-4" />
//           </Button>
//           <div className="hidden h-5 border-l border-gray-200 sm:block" />
//           <Input
//             value={resume.title}
//             onChange={(e) =>
//               updateResume((draft) => { draft.title = e.target.value; return draft; })
//             }
//             className="h-8 w-24 border-0 px-1 text-sm font-bold shadow-none focus-visible:ring-0 sm:w-36 sm:text-sm md:w-48 lg:w-64 lg:text-base"
//           />
//         </div>

//         <div className="flex items-center gap-1 sm:gap-2">
//           <span
//             className={cn(
//               "hidden text-xs font-medium sm:block",
//               savedState === "saved" ? "text-emerald-700" : "text-amber-700"
//             )}
//           >
//             {savedState === "saved" ? "● Saved" : "● Unsaved"}
//           </span>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={openSwitchTemplate}
//             className="hidden h-8 px-2 text-xs md:flex lg:px-3 lg:text-sm"
//           >
//             <LayoutTemplate className="h-3 w-3 lg:mr-1.5 lg:h-4 lg:w-4" />
//             <span className="hidden lg:inline">Switch Template</span>
//           </Button>
//           <Button
//             variant="outline"
//             size="sm"
//             onClick={printPreview}
//             className="hidden h-8 px-2 text-xs md:flex lg:px-3 lg:text-sm"
//           >
//             <Download className="h-3 w-3 lg:mr-1.5 lg:h-4 lg:w-4" />
//             <span className="hidden lg:inline">Export PDF</span>
//           </Button>
//           <Button
//             onClick={saveWorkspace}
//             disabled={isSaving}
//             size="sm"
//             className="h-8 bg-emerald-400 px-2 text-xs text-gray-950 hover:bg-emerald-500 sm:px-3 lg:text-sm"
//           >
//             {isSaving ? (
//               <CircleDashed className="h-3 w-3 animate-spin sm:mr-1" />
//             ) : (
//               <Save className="h-3 w-3 sm:mr-1" />
//             )}
//             <span className="hidden sm:inline">Save</span>
//           </Button>
//         </div>
//       </header>

//       {/* ── Mobile view tabs ── */}
//       <div className="flex flex-shrink-0 border-b bg-white lg:hidden">
//         {(["editor", "preview", "tools"] as MobileView[]).map((view) => (
//           <button
//             key={view}
//             className={cn(
//               "flex-1 py-2 text-center text-xs font-medium capitalize transition-colors",
//               mobileView === view
//                 ? "border-b-2 border-gray-950 text-gray-950"
//                 : "text-gray-400 hover:text-gray-700"
//             )}
//             onClick={() => setMobileView(view)}
//           >
//             {view}
//           </button>
//         ))}
//       </div>

//       {/* ── Main layout ── */}
//       <main className="relative min-h-0 flex-1 overflow-hidden lg:flex lg:flex-row">

//         {/* LEFT SIDEBAR — sections list */}
//         <aside
//           className={cn(
//             "flex-shrink-0 border-r bg-white transition-all duration-300 overflow-hidden",
//             "hidden lg:flex lg:flex-col",
//             activeTool
//               ? "lg:w-0 lg:border-r-0"
//               : leftSidebarOpen
//                 ? "lg:w-[260px] xl:w-[288px]"
//                 : "lg:w-0 lg:border-r-0",
//             mobileView === "editor" && "flex flex-col w-full absolute inset-0 z-10 lg:relative lg:inset-auto lg:z-auto"
//           )}
//         >
//           {/* Sidebar header */}
//           <div className="hidden h-14 flex-shrink-0 items-center gap-2 border-b px-4 lg:flex xl:h-16 xl:px-5">
//             <FileText className="h-5 w-5 flex-shrink-0 text-emerald-700 xl:h-6 xl:w-6" />
//             <h2 className="truncate text-lg font-bold xl:text-xl">Sections</h2>
//             <Button
//               variant="ghost"
//               size="icon"
//               className="ml-auto h-7 w-7"
//               onClick={() => setLeftSidebarOpen(false)}
//               title="Collapse sidebar"
//             >
//               <ArrowLeft className="h-4 w-4" />
//             </Button>
//           </div>

//           <ScrollArea className="min-h-0 flex-1">
//             <nav className="py-2">
//               {resume.sections.map((sectionId) => {
//                 const Icon = sectionMeta[sectionId].icon;
//                 const active = sectionId === activeSection;
//                 return (
//                   <div
//                     key={sectionId}
//                     className={cn(
//                       "group flex items-center gap-1 border-l-4 px-3 py-0.5",
//                       active ? "border-gray-950 bg-gray-100" : "border-transparent hover:bg-gray-50"
//                     )}
//                   >
//                     {reorderMode && (
//                       <div className="flex flex-col gap-0">
//                         <button className="text-[10px] leading-tight text-gray-400 hover:text-gray-900"
//                           onClick={() => moveSection(sectionId, -1)}>▲</button>
//                         <button className="text-[10px] leading-tight text-gray-400 hover:text-gray-900"
//                           onClick={() => moveSection(sectionId, 1)}>▼</button>
//                       </div>
//                     )}
//                     <button
//                       className="flex flex-1 items-center gap-2 py-2.5 text-left"
//                       onClick={() => setActiveSection(sectionId)}
//                     >
//                       {reorderMode ? (
//                         <GripVertical className="h-4 w-4 flex-shrink-0 text-gray-400" />
//                       ) : (
//                         <Icon className="h-4 w-4 flex-shrink-0 text-gray-500 xl:h-5 xl:w-5" />
//                       )}
//                       <span className={cn("truncate text-sm xl:text-base", active && "font-bold")}>
//                         {sectionMeta[sectionId].label}
//                       </span>
//                     </button>
//                     {removeMode ? (
//                       sectionMeta[sectionId].locked ? (
//                         <Lock className="h-4 w-4 flex-shrink-0 text-gray-300" />
//                       ) : (
//                         <Button variant="ghost" size="icon" className="h-7 w-7 flex-shrink-0 text-red-500"
//                           onClick={() => removeSection(sectionId)}>
//                           <Trash2 className="h-3.5 w-3.5" />
//                         </Button>
//                       )
//                     ) : (
//                       <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-emerald-600" />
//                     )}
//                   </div>
//                 );
//               })}
//             </nav>
//           </ScrollArea>

//           <div className="flex-shrink-0 space-y-2 border-t p-3 xl:p-4">
//             <Button variant="outline" className="h-8 w-full justify-center text-xs xl:h-9 xl:text-sm"
//               onClick={() => setIsAddSectionOpen(true)}>
//               <Plus className="mr-1 h-3.5 w-3.5" /> Add Section
//             </Button>
//             <Button
//               variant={removeMode ? "destructive" : "outline"}
//               className="h-8 w-full justify-center text-xs xl:h-9 xl:text-sm"
//               onClick={() => setRemoveMode((v) => !v)}
//             >
//               {removeMode ? "Done Removing" : "Remove Section"}
//             </Button>
//             <Button
//               variant={reorderMode ? "default" : "outline"}
//               className="h-8 w-full justify-center text-xs xl:h-9 xl:text-sm"
//               onClick={() => setReorderMode((v) => !v)}
//             >
//               {reorderMode ? "Done Reordering" : "Shuffle Layout"}
//             </Button>
//           </div>
//         </aside>

//         {/* Collapsed sidebar toggle — only when no tool open */}
//         {!leftSidebarOpen && !activeTool && (
//           <button
//             onClick={() => setLeftSidebarOpen(true)}
//             className="absolute left-0 top-1/2 z-20 hidden -translate-y-1/2 items-center justify-center rounded-r-lg border border-l-0 border-gray-200 bg-white py-3 pl-1 pr-2 shadow-sm transition-colors hover:bg-gray-50 lg:flex"
//             title="Expand sidebar"
//           >
//             <ArrowRight className="h-4 w-4 text-gray-500" />
//           </button>
//         )}

//         {/* ── EDITOR PANEL ── */}
//         <section
//           className={cn(
//             "min-h-0 flex-shrink-0 border-r bg-white transition-all duration-300",
//             "hidden lg:block",
//             // When tool open: editor takes fixed width, preview takes remaining
//             activeTool
//               ? "lg:w-[360px] xl:w-[400px]"
//               : leftSidebarOpen
//                 ? "lg:w-[360px] xl:w-[420px]"
//                 : "lg:w-[480px] xl:w-[520px]",
//             mobileView === "editor" && "block w-full"
//           )}
//         >
//           {/* Mobile section picker bar */}
//           <div className="flex overflow-x-auto border-b bg-gray-50 lg:hidden">
//             {resume.sections.map((sectionId) => (
//               <button
//                 key={sectionId}
//                 onClick={() => setActiveSection(sectionId)}
//                 className={cn(
//                   "flex-shrink-0 px-3 py-2 text-xs font-medium transition-colors",
//                   activeSection === sectionId
//                     ? "border-b-2 border-gray-950 bg-white text-gray-950"
//                     : "text-gray-500 hover:text-gray-800"
//                 )}
//               >
//                 {sectionMeta[sectionId].label}
//               </button>
//             ))}
//           </div>

//           <ScrollArea className="h-full">
//             <div className="p-3 sm:p-4 md:p-5 xl:p-6">
//               {renderEditor()}
//               <div className="mt-6 flex justify-between border-t pt-5">
//                 <Button variant="outline" size="icon" onClick={() => goToSection(-1)} disabled={sectionIndex <= 0}>
//                   <ArrowLeft className="h-4 w-4" />
//                 </Button>
//                 <Button variant="outline" size="icon" onClick={() => goToSection(1)} disabled={sectionIndex >= resume.sections.length - 1}>
//                   <ArrowRight className="h-4 w-4" />
//                 </Button>
//               </div>
//             </div>
//           </ScrollArea>
//         </section>

//         {/* ── PREVIEW PANEL ── */}
//         <section
//           className={cn(
//             "min-h-0 overflow-auto bg-gray-100 transition-all duration-300",
//             "hidden lg:block",
//             // Preview always takes remaining flex space
//             activeTool ? "lg:flex-1" : "lg:flex-1",
//             // Padding tightens when tool panel is open to give preview more room
//             activeTool ? "p-3 lg:p-4" : "p-3 sm:p-4 lg:p-6 xl:p-8",
//             mobileView === "preview" && "block flex-1"
//           )}
//         >
//           <div
//             className={cn(
//               "mx-auto transition-all duration-300",
//               // Scale down preview when tool panel is eating space
//               activeTool ? "max-w-[520px]" : "max-w-none"
//             )}
//           >
//             <div className="overflow-x-auto">
//               <ResumePreview refEl={previewRef} resume={resume} accent={previewAccent} />
//             </div>
//           </div>
//         </section>

//         {/* ── TOOL ICON RAIL ── */}
//         <aside
//           className="hidden flex-shrink-0 flex-col items-center gap-4 border-l bg-white py-6 lg:flex"
//           style={{ width: 74 }}
//         >
//           <Button
//             variant={activeTool === "strength" ? "default" : "ghost"}
//             size="icon"
//             className="h-10 w-10"
//             title="Resume strength"
//             onClick={() => handleToolToggle("strength")}
//           >
//             <BarChart3 className="h-5 w-5" />
//           </Button>
//           <Button
//             variant={activeTool === "jd" ? "default" : "ghost"}
//             size="icon"
//             className="h-10 w-10"
//             title="Match job description"
//             onClick={() => handleToolToggle("jd")}
//           >
//             <WandSparkles className="h-5 w-5" />
//           </Button>
//           <Button
//             variant={activeTool === "customize" ? "default" : "ghost"}
//             size="icon"
//             className="h-10 w-10"
//             title="Customize"
//             onClick={() => handleToolToggle("customize")}
//           >
//             <Settings className="h-5 w-5" />
//           </Button>
//         </aside>

//         {/* ── DESKTOP TOOL PANEL ── */}
//         {activeTool && (
//           <aside
//             className="absolute bottom-0 right-[74px] top-0 z-20 hidden w-[320px] xl:w-[360px] flex-shrink-0 overflow-hidden border-l bg-white shadow-2xl lg:block"
//           >
//             <ToolPanelContent
//               activeTool={activeTool}
//               resume={resume}
//               strength={strength}
//               onClose={() => {
//                 setActiveTool(null);
//                 setLeftSidebarOpen(true);
//               }}
//               onUpdate={updateResume}
//               onLayoutChange={applyLayoutPreset}
//             />
//           </aside>
//         )}

//         {/* ── MOBILE TOOLS PANEL ── */}
//         {mobileView === "tools" && (
//           <div className="block w-full bg-white lg:hidden">
//             <div className="flex flex-shrink-0 border-b">
//               {(["strength", "jd", "customize"] as const).map((tool) => (
//                 <button
//                   key={tool}
//                   className={cn(
//                     "flex-1 py-2.5 text-center text-xs font-medium capitalize transition-colors",
//                     activeTool === tool
//                       ? "border-b-2 border-gray-950 text-gray-950"
//                       : "text-gray-400 hover:text-gray-700"
//                   )}
//                   onClick={() => setActiveTool(activeTool === tool ? null : tool)}
//                 >
//                   {tool === "jd" ? "Match JD" : tool}
//                 </button>
//               ))}
//             </div>
//             {activeTool && (
//               <div className="overflow-auto" style={{ maxHeight: "calc(100dvh - 200px)" }}>
//                 <ToolPanelContent
//                   activeTool={activeTool}
//                   resume={resume}
//                   strength={strength}
//                   onClose={() => setActiveTool(null)}
//                   onUpdate={updateResume}
//                   onLayoutChange={applyLayoutPreset}
//                 />
//               </div>
//             )}
//           </div>
//         )}
//       </main>

//       {/* ── Mobile bottom bar ── */}
//       <div className="flex flex-shrink-0 items-center justify-around border-t bg-white py-1.5 lg:hidden">
//         <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={openSwitchTemplate}>
//           <LayoutTemplate className="mr-1 h-3.5 w-3.5" /> Template
//         </Button>
//         <Button variant="ghost" size="sm" className="h-8 px-3 text-xs" onClick={printPreview}>
//           <Download className="mr-1 h-3.5 w-3.5" /> Export
//         </Button>
//         <span className={cn("text-xs font-medium", savedState === "saved" ? "text-emerald-700" : "text-amber-700")}>
//           {savedState === "saved" ? "● Saved" : "● Unsaved"}
//         </span>
//       </div>

//       {/* Hidden file input */}
//       <input
//         ref={uploadInputRef}
//         type="file"
//         accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
//         className="hidden"
//         onChange={handleUploadSelected}
//       />

//       {/* ── Template Dialog ── */}
//       <TemplateDialog
//         open={templateDialogOpen}
//         onOpenChange={(open) => {
//           setTemplateDialogOpen(open);
//           if (!open) setIsSwitchingTemplate(false);
//         }}
//         selectedTemplate={resume.templateId}
//         accent={previewAccent}
//         onSelect={handleTemplateSelect}
//       />

//       {/* ── Start Dialog ── */}
//       <Dialog open={startDialogOpen} onOpenChange={setStartDialogOpen}>
//         <DialogContent className="flex items-center justify-center border-0 bg-transparent p-3 shadow-none sm:p-4">
//           <div className="w-full max-w-lg rounded-2xl border border-gray-200 bg-white p-[clamp(1.25rem,4vw,2rem)]">
//             <div className="mb-[clamp(0.75rem,2vw,1rem)] flex flex-col items-center gap-[clamp(0.5rem,2vw,0.75rem)]">
//               <div
//                 className="flex items-center justify-center rounded-[clamp(12px,3vw,18px)] bg-emerald-800 text-white"
//                 style={{ width: "clamp(48px,10vw,64px)", height: "clamp(48px,10vw,64px)" }}
//               >
//                 <FileText style={{ width: "clamp(22px,5vw,30px)", height: "clamp(22px,5vw,30px)" }} />
//               </div>
//               <DialogHeader>
//                 <DialogTitle
//                   className="text-center font-medium text-gray-900"
//                   style={{ fontSize: "clamp(1.1rem,4vw,1.6rem)", lineHeight: 1.2 }}
//                 >
//                   Let's build your resume
//                 </DialogTitle>
//               </DialogHeader>
//               <p
//                 className="mx-auto max-w-sm text-center text-gray-500"
//                 style={{ fontSize: "clamp(0.75rem,2.5vw,0.95rem)", lineHeight: 1.5 }}
//               >
//                 Start fresh with a blank editor, or upload an existing resume and let AI fill it in for you.
//               </p>
//             </div>
//             <div className="flex flex-col gap-[clamp(0.5rem,2vw,0.75rem)]">
//               <button
//                 className="flex w-full items-center gap-[clamp(10px,3vw,16px)] rounded-xl border-2 border-indigo-300 bg-indigo-50 text-left transition-colors hover:bg-indigo-100"
//                 style={{ padding: "clamp(0.75rem,3vw,1.1rem) clamp(0.875rem,3vw,1.25rem)" }}
//                 onClick={() => { setStartDialogOpen(false); setUploadDialogOpen(true); }}
//               >
//                 <div
//                   className="flex shrink-0 items-center justify-center rounded-lg bg-indigo-100"
//                   style={{ width: "clamp(36px,8vw,48px)", height: "clamp(36px,8vw,48px)" }}
//                 >
//                   <Upload className="text-indigo-600" style={{ width: "clamp(18px,4vw,24px)", height: "clamp(18px,4vw,24px)" }} />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <div className="font-medium text-indigo-900" style={{ fontSize: "clamp(0.85rem,3vw,1rem)", marginBottom: 2 }}>
//                     Upload existing resume
//                   </div>
//                   <div className="text-indigo-700" style={{ fontSize: "clamp(0.7rem,2.2vw,0.82rem)", lineHeight: 1.4 }}>
//                     Upload a PDF or Word doc — AI will parse and prefill the editor
//                   </div>
//                 </div>
//                 <ArrowRight className="shrink-0 text-indigo-500" style={{ width: 16, height: 16 }} />
//               </button>

//               <button
//                 className="flex w-full items-center gap-[clamp(10px,3vw,16px)] rounded-xl border border-gray-200 bg-gray-50 text-left transition-colors hover:bg-gray-100"
//                 style={{ padding: "clamp(0.75rem,3vw,1.1rem) clamp(0.875rem,3vw,1.25rem)" }}
//                 onClick={startFromScratch}
//               >
//                 <div
//                   className="flex shrink-0 items-center justify-center rounded-lg bg-gray-100"
//                   style={{ width: "clamp(36px,8vw,48px)", height: "clamp(36px,8vw,48px)" }}
//                 >
//                   <FileText className="text-gray-500" style={{ width: "clamp(18px,4vw,24px)", height: "clamp(18px,4vw,24px)" }} />
//                 </div>
//                 <div className="min-w-0 flex-1">
//                   <div className="font-medium text-gray-900" style={{ fontSize: "clamp(0.85rem,3vw,1rem)", marginBottom: 2 }}>
//                     Start from scratch
//                   </div>
//                   <div className="text-gray-500" style={{ fontSize: "clamp(0.7rem,2.2vw,0.82rem)", lineHeight: 1.4 }}>
//                     Blank editor — build your resume section by section
//                   </div>
//                 </div>
//                 <ArrowRight className="shrink-0 text-gray-400" style={{ width: 16, height: 16 }} />
//               </button>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ── Upload Dialog ── */}
//       <Dialog open={uploadDialogOpen} onOpenChange={setUploadDialogOpen}>
//         <DialogContent className="mx-2 w-[calc(100vw-1rem)] max-w-2xl rounded-2xl p-4 sm:p-6 md:p-8">
//           <div className="mb-4 flex items-center gap-2 sm:mb-6">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => { setUploadDialogOpen(false); setStartDialogOpen(true); }}
//               className="h-8 px-2 text-xs sm:text-sm"
//             >
//               <ArrowLeft className="mr-1 h-3 w-3 sm:h-4 sm:w-4" /> Back
//             </Button>
//             <DialogTitle className="text-base font-bold sm:text-lg md:text-xl">
//               Upload Your Resume
//             </DialogTitle>
//           </div>
//           <button
//             className="flex w-full flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 p-6 text-center transition-colors hover:border-indigo-300 hover:bg-indigo-50 sm:p-10 md:p-14"
//             onClick={chooseUploadFile}
//             disabled={isParsingUpload}
//           >
//             <Upload className="mb-3 h-10 w-10 rounded-xl bg-indigo-100 p-2 text-indigo-500 sm:mb-5 sm:h-14 sm:w-14 sm:rounded-2xl sm:p-3" />
//             <div className="text-sm font-bold sm:text-lg md:text-xl">Drag & drop your resume here</div>
//             <div className="mt-1 text-xs text-gray-500 sm:mt-2 sm:text-sm">or click to browse files</div>
//             <div className="mt-3 flex gap-2 text-xs font-semibold text-gray-500 sm:mt-4">
//               <span className="rounded bg-gray-100 px-2 py-1">PDF</span>
//               <span className="rounded bg-gray-100 px-2 py-1">DOCX</span>
//               <span className="rounded bg-gray-100 px-2 py-1">Max 5MB</span>
//             </div>
//             <span className="mt-4 rounded-lg bg-indigo-600 px-5 py-2 text-xs font-bold text-white sm:mt-6 sm:rounded-xl sm:px-6 sm:py-2.5 sm:text-sm">
//               Choose File
//             </span>
//           </button>
//         </DialogContent>
//       </Dialog>

//       {/* ── Analyzing Dialog ── */}
//       <Dialog open={analyzingDialogOpen} onOpenChange={() => undefined}>
//         <DialogContent className="mx-2 w-[calc(100vw-1rem)] max-w-lg rounded-2xl p-6 sm:p-8 md:p-10">
//           <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50 ring-2 ring-indigo-100 sm:mb-6 sm:h-20 sm:w-20 sm:ring-4">
//             <CircleDashed className="h-7 w-7 animate-spin text-indigo-500 sm:h-10 sm:w-10" />
//           </div>
//           <DialogHeader>
//             <DialogTitle className="text-center text-lg font-bold sm:text-xl md:text-2xl">
//               Analyzing your resume…
//             </DialogTitle>
//           </DialogHeader>
//           <p className="mt-1 text-center text-xs text-gray-500 sm:text-sm">
//             Our AI is reading and structuring your data
//           </p>
//           <div className="mx-auto mt-5 w-full max-w-sm space-y-3 sm:mt-7 sm:space-y-4">
//             {[
//               "Extracting text from your resume",
//               "Analyzing your experience & skills",
//               "Structuring your data",
//               "Prefilling your resume editor",
//             ].map((label, index) => (
//               <div
//                 key={label}
//                 className={cn(
//                   "flex items-center gap-3 text-xs sm:text-sm",
//                   analysisStep >= index ? "text-emerald-700" : "text-gray-400"
//                 )}
//               >
//                 {analysisStep > index ? (
//                   <CheckCircle2 className="h-5 w-5 flex-shrink-0 sm:h-6 sm:w-6" />
//                 ) : analysisStep === index ? (
//                   <CircleDashed className="h-5 w-5 flex-shrink-0 animate-spin text-indigo-500 sm:h-6 sm:w-6" />
//                 ) : (
//                   <span className="h-5 w-5 flex-shrink-0 rounded-full border-2 border-gray-300 sm:h-6 sm:w-6" />
//                 )}
//                 <span className={analysisStep === index ? "font-bold text-gray-900" : ""}>
//                   {label}
//                 </span>
//               </div>
//             ))}
//           </div>
//         </DialogContent>
//       </Dialog>

//       {/* ── Add Section Dialog ── */}
//       <Dialog open={isAddSectionOpen} onOpenChange={setIsAddSectionOpen}>
//         <DialogContent className="mx-2 w-[calc(100vw-1rem)] max-w-xl rounded-2xl p-4 sm:p-6">
//           <DialogHeader>
//             <DialogTitle className="text-base font-bold sm:text-xl">Add a Section</DialogTitle>
//           </DialogHeader>
//           <div className="grid grid-cols-2 gap-2 py-3 sm:gap-3 sm:py-4 md:grid-cols-3">
//             {addableSections.map((sectionId) => {
//               const Icon = sectionMeta[sectionId].icon;
//               const added = resume.sections.includes(sectionId);
//               return (
//                 <button
//                   key={sectionId}
//                   disabled={added}
//                   className={cn(
//                     "flex min-h-[72px] flex-col items-center justify-center gap-2 rounded-xl border p-3 text-center transition-colors sm:min-h-[88px] sm:gap-2.5 sm:p-4",
//                     added
//                       ? "bg-gray-50 text-gray-300"
//                       : "hover:border-emerald-500 hover:bg-emerald-50"
//                   )}
//                   onClick={() => addSection(sectionId)}
//                 >
//                   <span className={cn("rounded-full p-2", added ? "bg-gray-100 text-gray-300" : "bg-emerald-50 text-emerald-700")}>
//                     <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
//                   </span>
//                   <span className="text-xs font-semibold leading-tight sm:text-sm">
//                     {sectionMeta[sectionId].label}
//                   </span>
//                 </button>
//               );
//             })}
//           </div>
//         </DialogContent>
//       </Dialog>
//     </div>
//   );
// };

// export default ResumeBuilder;