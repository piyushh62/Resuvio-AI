import type { FileText } from "lucide-react";

export type SectionId =
  | "personal"
  | "summary"
  | "experience"
  | "education"
  | "skills"
  | "projects"
  | "certifications"
  | "awards"
  | "languages"
  | "volunteer"
  | "publications"
  | "presentations"
  | "licensure"
  | "barAdmissions"
  | "custom"
  | "memberships"
  | "clinical"
  | "grants"
  | "teaching"
  | "security"
  | "workshops"
  | "internships"
  | "declaration";

export type TemplateId = "modern" | "sidebar" | "executive" | "ats";

export type StylePreset =
  | "mono"
  | "tech"
  | "corporate"
  | "academic"
  | "creative"
  | "generalist";

export type LayoutPreset =
  | "steady"
  | "potential"
  | "pivot"
  | "specialist"
  | "authority"
  | "academic";

export type TextSize = "small" | "medium" | "large";
export type Spacing = "compact" | "normal" | "relaxed";
export type ToolPanel = "strength" | "jd" | "customize" | null;
export type MobileView = "editor" | "preview" | "tools";

export interface PersonalInfo {
  name: string;
  headline: string;
  email: string;
  phone: string;
  location: string;
  links: string[];
}

export interface ExperienceItem {
  jobTitle: string;
  company: string;
  employmentType: string;
  location: string;
  dates: string;
  description: string;
}

export interface EducationItem {
  degree: string;
  institution: string;
  honors: string;
  dates: string;
  gpa: string;
  description: string;
}

export interface SkillGroup {
  category: string;
  items: string;
}

export interface ProjectItem {
  name: string;
  role: string;
  technologies: string;
  link: string;
  description: string;
}

export interface CertificationItem {
  name: string;
  issuer: string;
  date: string;
}

export interface SimpleSection {
  id: SectionId;
  title: string;
  content: string;
}

export interface ResumeCustomization {
  accentColor: string;
  fontFamily: string;
  textSize: TextSize;
  spacing: Spacing;
  nameSize: number;
  sectionTitleSize: number;
  bodyTextSize: number;
  lineHeight: number;
  pageMargin: number;
  sectionGap: number;
  entryGap: number;
}

export interface ResumeWorkspace {
  title: string;
  templateId: TemplateId;
  stylePreset: StylePreset;
  layoutPreset: LayoutPreset;
  customization: ResumeCustomization;
  sections: SectionId[];
  personal: PersonalInfo;
  summary: string;
  experience: ExperienceItem[];
  education: EducationItem[];
  skills: SkillGroup[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  extras: Partial<Record<SectionId, SimpleSection>>;
  targetJobDescription: string;
}

export type ApiErrorLike = {
  response?: { data?: { message?: string } };
  request?: unknown;
  message?: string;
};

export interface SectionMeta {
  label: string;
  icon: typeof FileText;
  locked?: boolean;
}

export interface StrengthResult {
  score: number;
  label: string;
  completeness: number;
  bulletQuality: number;
  structure: number;
  atsSafety: number;
  keywordDensity: number;
}
