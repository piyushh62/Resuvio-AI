import type React from "react";
import {
  FileText,
  Target,
  Upload,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  defaultCustomization,
  layoutPresets,
  stylePresets,
} from "./constants";
import Field from "./Field";
import type {
  LayoutPreset,
  ResumeWorkspace,
  Spacing,
  StrengthResult,
  TextSize,
  ToolPanel,
} from "./types";

const Metric = ({ label, value }: { label: string; value: string }) => (
  <div className="flex justify-between text-sm font-medium">
    <span className="text-muted-foreground/80">{label}</span>
    <strong className="text-foreground font-semibold">{value}</strong>
  </div>
);

const SliderField = ({
  label,
  value,
  suffix = "",
  min,
  max,
  step,
  onChange,
}: {
  label: string;
  value: number;
  suffix?: string;
  min: number;
  max: number;
  step: number;
  onChange: (value: number) => void;
}) => (
  <div className="space-y-2.5">
    <div className="flex justify-between items-center">
      <label className="text-xs xl:text-sm font-semibold text-foreground/90 tracking-tight">
        {label}
      </label>
      <span className="text-xs xl:text-sm font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-md">
        {value}
        {suffix}
      </span>
    </div>
    <input
      className="w-full accent-primary cursor-pointer h-2 rounded-lg"
      type="range"
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onChange(Number(event.target.value))}
    />
  </div>
);

const CustomizePanel = ({
  resume,
  onUpdate,
  onLayoutChange,
}: {
  resume: ResumeWorkspace;
  onUpdate: (updater: (current: ResumeWorkspace) => ResumeWorkspace) => void;
  onLayoutChange: (layoutPreset: LayoutPreset) => void;
}) => (
  <div className="space-y-6 sm:space-y-7">
    <div>
      <h4 className="mb-3 text-sm font-bold text-foreground/95 sm:text-base tracking-tight">Style Preset</h4>
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        {stylePresets.map((preset) => (
          <button
            key={preset.id}
            className={cn(
              "rounded-xl border border-border/40 p-2.5 text-left text-xs transition-all duration-300 sm:p-3 sm:text-sm bg-secondary/20 hover:bg-secondary/50 hover:border-violet-500/30",
              resume.stylePreset === preset.id && "border-violet-500 bg-violet-500/10 shadow-sm"
            )}
            onClick={() =>
              onUpdate((draft) => {
                draft.stylePreset = preset.id;
                draft.customization.accentColor = preset.accent;
                draft.customization.fontFamily = preset.font;
                return draft;
              })
            }
          >
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-3 w-3 rounded-full sm:h-3.5 sm:w-3.5 flex-shrink-0"
                style={{ backgroundColor: preset.accent }}
              />
              <span className="font-semibold text-foreground text-xs sm:text-sm">{preset.label}</span>
            </div>
            <p className="mt-1 text-[9px] text-muted-foreground/70 leading-tight sm:text-[10px]">
              {preset.description}
            </p>
          </button>
        ))}
      </div>
    </div>
    <div>
      <h4 className="mb-3 text-sm font-bold text-foreground/95 sm:text-base tracking-tight">Section Layout</h4>
      <div className="space-y-2.5 sm:space-y-3">
        {layoutPresets.map((preset) => (
          <button
            key={preset.id}
            className={cn(
              "w-full rounded-xl border border-border/40 bg-secondary/20 p-3 text-left transition-all duration-300 sm:p-4 hover:bg-secondary/50 hover:border-violet-500/30",
              resume.layoutPreset === preset.id && "border-violet-500 bg-violet-500/10 shadow-sm"
            )}
            onClick={() => onLayoutChange(preset.id)}
          >
            <div className="flex items-center gap-2 mb-1.5">
              <span className="text-sm font-semibold sm:text-base text-foreground">{preset.label}</span>
              <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[9px] font-bold text-primary sm:text-[10px]">
                {preset.strategy}
              </span>
            </div>
            <div className="text-xs text-muted-foreground/70 sm:text-sm leading-snug">{preset.description}</div>
          </button>
        ))}
      </div>
    </div>
    <Field label="Accent Color">
      <Input
        type="color"
        value={resume.customization.accentColor}
        onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
          onUpdate((draft) => {
            draft.customization.accentColor = event.target.value;
            return draft;
          })
        }
      />
    </Field>
    <Field label="Font Family">
      <select
        className="h-9 w-full rounded-lg border border-input/60 bg-background/50 px-3 py-2 text-sm font-normal ring-offset-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 focus:border-primary/40 hover:border-input/80 cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          paddingRight: '28px',
        }}
        value={resume.customization.fontFamily}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onUpdate((draft) => {
            draft.customization.fontFamily = event.target.value;
            return draft;
          })
        }
      >
        <option value="Lato">Lato</option>
        <option value="Inter">Inter</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
      </select>
    </Field>
    <Field label="Text Size">
      <select
        className="h-9 w-full rounded-lg border border-input/60 bg-background/50 px-3 py-2 text-sm font-normal ring-offset-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 focus:border-primary/40 hover:border-input/80 cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          paddingRight: '28px',
        }}
        value={resume.customization.textSize}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onUpdate((draft) => {
            draft.customization.textSize = event.target.value as TextSize;
            return draft;
          })
        }
      >
        <option value="small">Small</option>
        <option value="medium">Medium</option>
        <option value="large">Large</option>
      </select>
    </Field>
    <Field label="Spacing">
      <select
        className="h-9 w-full rounded-lg border border-input/60 bg-background/50 px-3 py-2 text-sm font-normal ring-offset-background transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-0 focus:border-primary/40 hover:border-input/80 cursor-pointer appearance-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23666' d='M10.293 3.293L6 7.586 1.707 3.293A1 1 0 00.293 4.707l5 5a1 1 0 001.414 0l5-5a1 1 0 10-1.414-1.414z'/%3E%3C/svg%3E")`,
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'right 8px center',
          paddingRight: '28px',
        }}
        value={resume.customization.spacing}
        onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
          onUpdate((draft) => {
            draft.customization.spacing = event.target.value as Spacing;
            return draft;
          })
        }
      >
        <option value="compact">Compact</option>
        <option value="normal">Normal</option>
        <option value="relaxed">Relaxed</option>
      </select>
    </Field>
    <h4 className="text-sm font-bold text-foreground/95 sm:text-base tracking-tight border-t border-border/20 pt-4 mt-2">Advanced Customization</h4>
    <SliderField
      label="Name Size"
      value={resume.customization.nameSize}
      suffix="pt"
      min={16}
      max={32}
      step={1}
      onChange={(value) =>
        onUpdate((draft) => {
          draft.customization.nameSize = value;
          return draft;
        })
      }
    />
    <SliderField
      label="Section Title"
      value={resume.customization.sectionTitleSize}
      suffix="pt"
      min={10}
      max={18}
      step={1}
      onChange={(value) =>
        onUpdate((draft) => {
          draft.customization.sectionTitleSize = value;
          return draft;
        })
      }
    />
    <SliderField
      label="Body Text"
      value={resume.customization.bodyTextSize}
      suffix="pt"
      min={8}
      max={14}
      step={0.5}
      onChange={(value) =>
        onUpdate((draft) => {
          draft.customization.bodyTextSize = value;
          return draft;
        })
      }
    />
    <SliderField
      label="Line Height"
      value={resume.customization.lineHeight}
      min={1}
      max={1.8}
      step={0.05}
      onChange={(value) =>
        onUpdate((draft) => {
          draft.customization.lineHeight = value;
          return draft;
        })
      }
    />
    <SliderField
      label="Page Margin"
      value={resume.customization.pageMargin}
      suffix="px"
      min={20}
      max={60}
      step={1}
      onChange={(value) =>
        onUpdate((draft) => {
          draft.customization.pageMargin = value;
          return draft;
        })
      }
    />
    <SliderField
      label="Section Gap"
      value={resume.customization.sectionGap}
      suffix="rem"
      min={0.5}
      max={2.5}
      step={0.1}
      onChange={(value) =>
        onUpdate((draft) => {
          draft.customization.sectionGap = value;
          return draft;
        })
      }
    />
    <SliderField
      label="Entry Gap"
      value={resume.customization.entryGap}
      suffix="rem"
      min={0.25}
      max={1.5}
      step={0.05}
      onChange={(value) =>
        onUpdate((draft) => {
          draft.customization.entryGap = value;
          return draft;
        })
      }
    />
    <Button
      variant="outline"
      className="w-full font-semibold h-9 text-sm hover:bg-secondary/60 border-border/60 mt-4"
      onClick={() =>
        onUpdate((draft) => {
          draft.customization = { ...defaultCustomization };
          return draft;
        })
      }
    >
      Reset to Defaults
    </Button>
  </div>
);

interface ToolPanelContentProps {
  activeTool: ToolPanel;
  resume: ResumeWorkspace;
  strength: StrengthResult;
  onClose: () => void;
  onUpdate: (updater: (current: ResumeWorkspace) => ResumeWorkspace) => void;
  onLayoutChange: (layoutPreset: LayoutPreset) => void;
}

const ToolPanelContent = ({
  activeTool,
  resume,
  strength,
  onClose,
  onUpdate,
  onLayoutChange,
}: ToolPanelContentProps) => (
  <div className="flex h-full flex-col bg-transparent">
    <div className="flex h-14 items-center justify-between border-b border-border/40 bg-secondary/30 px-4 sm:h-20 sm:px-6">
      <h3 className="text-sm font-bold text-foreground/95 sm:text-lg tracking-tight">
        {activeTool === "strength"
          ? "Resume Strength"
          : activeTool === "jd"
          ? "Match JD"
          : "Customize"}
      </h3>
      <Button variant="ghost" size="icon" className="hover:bg-primary/10 transition-colors" onClick={onClose}>
        <X className="h-5 w-5" />
      </Button>
    </div>
    <ScrollArea className="min-h-0 flex-1">
      <div className="space-y-5 p-4 sm:space-y-6 sm:p-6">
        {activeTool === "strength" && (
          <>
            <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-[6px] border-violet-500/20 bg-violet-500/10 text-3xl font-bold text-violet-600 sm:h-36 sm:w-36 sm:border-[8px] sm:text-5xl shadow-inner">
              {strength.score}
            </div>
            <div className="text-center text-lg font-bold sm:text-2xl text-foreground/95">{strength.label}</div>
            <Metric label="Completeness" value={`${strength.completeness} / 10`} />
            <Metric label="Bullet Quality" value={`${strength.bulletQuality} / 35`} />
            <Metric label="Structure" value={`${strength.structure} / 20`} />
            <Metric label="ATS Safety" value={`${strength.atsSafety} / 10`} />
            <Metric label="Keyword Density" value={`${strength.keywordDensity} / 10`} />
            <div className="rounded-xl border border-violet-500/20 border-l-4 border-l-violet-500 bg-violet-500/5 p-3 text-xs sm:p-4 sm:text-sm">
              <div className="font-bold text-foreground/95">Improvement Areas</div>
              <p className="mt-1.5 sm:mt-2 text-muted-foreground/80 leading-relaxed text-xs sm:text-sm">
                Fill missing fields, add measurable bullets, and paste a JD to improve keyword density.
              </p>
            </div>
          </>
        )}
        {activeTool === "jd" && (
          <>
            <h4 className="text-sm font-bold text-foreground/95 sm:text-base tracking-tight">1. Provide the Job Description</h4>
            <div className="grid grid-cols-2 gap-2.5">
              <Button variant="outline" size="sm" className="font-medium text-xs sm:text-sm h-8 hover:bg-secondary/60 border-border/60">
                <FileText className="mr-1.5 h-3.5 w-3.5" /> Paste Text
              </Button>
              <Button variant="outline" size="sm" className="font-medium text-xs sm:text-sm h-8 hover:bg-secondary/60 border-border/60">
                <Upload className="mr-1.5 h-3.5 w-3.5" /> Upload File
              </Button>
            </div>
            <Textarea
              value={resume.targetJobDescription}
              onChange={(event) =>
                onUpdate((draft) => {
                  draft.targetJobDescription = event.target.value;
                  return draft;
                })
              }
              rows={10}
              placeholder="Paste the full job description here..."
              className="text-sm"
            />
            <Button className="w-full font-semibold h-9 text-sm" disabled={!resume.targetJobDescription.trim()}>
              <Target className="mr-2 h-4 w-4" /> Calculate Fit Score
            </Button>
            <Progress value={strength.keywordDensity * 10} />
          </>
        )}
        {activeTool === "customize" && (
          <CustomizePanel resume={resume} onUpdate={onUpdate} onLayoutChange={onLayoutChange} />
        )}
      </div>
    </ScrollArea>
  </div>
);

export default ToolPanelContent;
