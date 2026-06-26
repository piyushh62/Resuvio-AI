import { sectionMeta, stylePresets } from "./constants";
import type {
  ResumeWorkspace,
  SectionId,
  StrengthResult,
  StylePreset,
  TemplateId,
} from "./types";

export const isSectionId = (value: unknown): value is SectionId =>
  typeof value === "string" && value in sectionMeta;

export const isTemplateId = (value: unknown): value is TemplateId =>
  value === "modern" || value === "sidebar" || value === "executive" || value === "ats";

export const isFilled = (value: string | undefined) => Boolean(value?.trim());

export const getPresetAccent = (stylePreset: StylePreset) =>
  stylePresets.find((preset) => preset.id === stylePreset)?.accent || "#111827";

export const calculateStrength = (resume: ResumeWorkspace): StrengthResult => {
  const completenessChecks = [
    resume.personal.name,
    resume.personal.email,
    resume.personal.headline,
    resume.summary,
    resume.experience[0]?.jobTitle,
    resume.experience[0]?.company,
    resume.experience[0]?.description,
    resume.education[0]?.degree,
    resume.education[0]?.institution,
    resume.skills[0]?.items,
  ];
  const completeness = completenessChecks.filter(isFilled).length;
  const bulletQuality = resume.experience.some((item) =>
    /\d|%|increased|reduced|built|led|improved/i.test(item.description)
  )
    ? 35
    : 18;
  const structure = Math.min(20, resume.sections.length * 2);
  const atsSafety = resume.templateId === "sidebar" ? 8 : 10;
  const keywords = resume.targetJobDescription
    .split(/\W+/)
    .filter((word) => word.length > 4)
    .slice(0, 30);
  const resumeText = JSON.stringify(resume).toLowerCase();
  const keywordDensity = keywords.length
    ? Math.min(
        10,
        keywords.filter((word) => resumeText.includes(word.toLowerCase())).length
      )
    : 3;
  const score = Math.min(
    100,
    Math.round(
      (completeness / completenessChecks.length) * 25 +
        bulletQuality +
        structure +
        atsSafety +
        keywordDensity
    )
  );

  return {
    score,
    label:
      score >= 85
        ? "Strong"
        : score >= 70
        ? "Good"
        : score >= 50
        ? "Fair"
        : "Needs Work",
    completeness,
    bulletQuality,
    structure,
    atsSafety,
    keywordDensity,
  };
};
