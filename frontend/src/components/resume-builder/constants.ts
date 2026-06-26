import {
  Award,
  BookOpen,
  BriefcaseBusiness,
  FileText,
  Languages,
  Shield,
  Sparkles,
} from "lucide-react";
import type {
  LayoutPreset,
  ResumeCustomization,
  ResumeWorkspace,
  SectionId,
  SectionMeta,
  StylePreset,
  TemplateId,
} from "./types";

export const requiredSections: SectionId[] = [
  "personal",
  "summary",
  "experience",
  "education",
  "skills",
];

export const sectionMeta: Record<SectionId, SectionMeta> = {
  personal: { label: "Personal Info", icon: FileText, locked: true },
  summary: { label: "Summary", icon: FileText },
  experience: { label: "Work Experience", icon: BriefcaseBusiness },
  education: { label: "Education", icon: BookOpen },
  skills: { label: "Skills", icon: Sparkles },
  projects: { label: "Projects", icon: Award },
  certifications: { label: "Certifications", icon: Award },
  awards: { label: "Awards & Honors", icon: Award },
  languages: { label: "Languages", icon: Languages },
  volunteer: { label: "Volunteer Experience", icon: BriefcaseBusiness },
  publications: { label: "Publications", icon: BookOpen },
  presentations: { label: "Presentations", icon: FileText },
  licensure: { label: "Licensure", icon: Award },
  barAdmissions: { label: "Bar Admissions", icon: Award },
  custom: { label: "Custom Section", icon: FileText },
  memberships: { label: "Memberships", icon: BriefcaseBusiness },
  clinical: { label: "Clinical Experience", icon: BriefcaseBusiness },
  grants: { label: "Grants & Funding", icon: Award },
  teaching: { label: "Teaching Experience", icon: BookOpen },
  security: { label: "Security Clearance", icon: Shield },
  workshops: { label: "Workshops & Hackathons", icon: Sparkles },
  internships: { label: "Internships", icon: BriefcaseBusiness },
  declaration: { label: "Declaration", icon: FileText },
};

export const addableSections: SectionId[] = [
  "projects",
  "certifications",
  "awards",
  "languages",
  "volunteer",
  "publications",
  "presentations",
  "licensure",
  "barAdmissions",
  "custom",
  "memberships",
  "clinical",
  "grants",
  "teaching",
  "security",
  "workshops",
  "internships",
  "declaration",
];

export const templates: { id: TemplateId; label: string; description: string }[] = [
  { id: "modern", label: "Modern Centered", description: "Clean centered header with classic section flow." },
  { id: "sidebar", label: "Classic Sidebar", description: "Strong sidebar for contact, skills, and quick scanning." },
  { id: "executive", label: "Monochrome", description: "Clean two-column black-and-white professional layout." },
  { id: "ats", label: "Premium ATS", description: "ATS-optimized single column with double-lined headers." },
];

export const stylePresets: {
  id: StylePreset;
  label: string;
  accent: string;
  description: string;
  font: string;
}[] = [
  { id: "mono", label: "Classic", accent: "#111827", description: "Traditional serif with timeless black tones", font: "Georgia" },
  { id: "tech", label: "Modern", accent: "#1f4e79", description: "Clean sans-serif with a professional blue accent", font: "Lato" },
  { id: "creative", label: "Creative", accent: "#0f766e", description: "Artistic flair with a teal-coral palette", font: "Inter" },
  { id: "generalist", label: "Minimal", accent: "#047857", description: "Ultra-clean monochrome with airy spacing", font: "Inter" },
  { id: "corporate", label: "Executive", accent: "#0f3d68", description: "Elegant serif with deep navy authority", font: "Georgia" },
  { id: "academic", label: "Bold", accent: "#9f1239", description: "High-contrast bold type for maximum impact", font: "Arial" },
];

export const layoutPresets: {
  id: LayoutPreset;
  label: string;
  strategy: string;
  description: string;
  order: SectionId[];
}[] = [
  {
    id: "steady",
    label: "Chronological",
    strategy: "Chronological",
    description: "Experience leads the way. Best for professionals with clear career progression.",
    order: ["personal", "summary", "experience", "education", "skills"],
  },
  {
    id: "potential",
    label: "Creative",
    strategy: "Creative",
    description: "Education and projects first. Best for recent graduates and creative fields.",
    order: ["personal", "summary", "education", "projects", "skills", "experience"],
  },
  {
    id: "pivot",
    label: "Functional",
    strategy: "Functional",
    description: "Skills lead. Best for career changers who want to highlight what they know.",
    order: ["personal", "summary", "skills", "experience", "projects", "education"],
  },
  {
    id: "specialist",
    label: "Hybrid",
    strategy: "Hybrid",
    description: "Skills-first with projects up front. Best for engineers and technical roles.",
    order: ["personal", "summary", "skills", "projects", "experience", "education"],
  },
  {
    id: "authority",
    label: "Strategic",
    strategy: "Strategic",
    description: "Experience and impact lead. Best for senior professionals and leaders.",
    order: ["personal", "summary", "experience", "certifications", "awards", "education", "skills"],
  },
  {
    id: "academic",
    label: "Academic",
    strategy: "Academic",
    description: "Research-first ordering. Publications and grants up front.",
    order: ["personal", "summary", "education", "publications", "grants", "teaching", "skills"],
  },
];

// ── Contextual Tips ──
export const contextualTips: Record<string, string> = {
  personal: "Include a professional headline and all relevant contact links.",
  summary: "Keep it to 2-3 sentences highlighting your value proposition.",
  experience: "Start each bullet with an action verb and quantify achievements.",
  education: "Mention relevant coursework, honors, and GPA if above 3.5.",
  skills: "Group skills by category and list most relevant first.",
  projects: "Include measurable outcomes and the technologies you used.",
  certifications: "List industry-recognized certifications with issue dates.",
  awards: "Focus on awards relevant to your target role.",
  languages: "Include proficiency level (e.g., Native, Fluent, Conversational).",
  volunteer: "Highlight transferable skills from volunteer work.",
  publications: "Use proper citation format for your field.",
  presentations: "Include event name, date, and audience size.",
  internships: "Focus on skills gained and projects delivered.",
  default: "Fill every section with specific, measurable achievements.",
};

export const defaultCustomization: ResumeCustomization = {
  accentColor: "#111827",
  fontFamily: "Lato",
  textSize: "medium",
  spacing: "normal",
  nameSize: 20,
  sectionTitleSize: 13,
  bodyTextSize: 10.5,
  lineHeight: 1.4,
  pageMargin: 36,
  sectionGap: 1.2,
  entryGap: 0.75,
};

export const createInitialWorkspace = (templateId: TemplateId = "modern"): ResumeWorkspace => ({
  title: "Untitled Resume",
  templateId,
  stylePreset: "mono",
  layoutPreset: "steady",
  customization: { ...defaultCustomization },
  sections: ["personal", "summary", "experience", "education", "skills"],
  personal: {
    name: "",
    headline: "",
    email: "",
    phone: "",
    location: "",
    links: [],
  },
  summary: "",
  experience: [
    { jobTitle: "", company: "", employmentType: "", location: "", dates: "", description: "" },
  ],
  education: [
    { degree: "", institution: "", honors: "", dates: "", gpa: "", description: "" },
  ],
  skills: [{ category: "", items: "" }],
  projects: [],
  certifications: [],
  extras: {},
  targetJobDescription: "",
});
