import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { templates } from "./constants";
import type { TemplateId } from "./types";

interface TemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedTemplate: TemplateId;
  accent: string;
  onSelect: (templateId: TemplateId) => void;
}

const TemplateThumb = ({ templateId, accent }: { templateId: TemplateId; accent: string }) => {
  if (templateId === "executive") {
    return (
      <div className="flex h-20 w-full flex-col rounded border border-border bg-card p-1.5 sm:h-24 sm:p-2 md:h-28 md:p-3">
        <div className="mb-1 space-y-0.5 sm:mb-1.5">
          <div className="h-1.5 w-12 rounded-sm bg-foreground sm:w-16" />
          <div className="h-[1px] w-full bg-border mt-0.5 sm:mt-1" />
        </div>
        <div className="grid flex-1 grid-cols-[30%_1fr] gap-1 sm:gap-1.5">
          <div className="space-y-0.5 border-r border-border pr-1 sm:space-y-1">
            <div className="h-1 w-3/4 rounded bg-foreground" />
            <div className="h-1 rounded bg-secondary" />
            <div className="h-1 rounded bg-secondary" />
            <div className="h-1 w-3/4 rounded bg-foreground mt-1" />
            <div className="h-1 rounded bg-secondary" />
          </div>
          <div className="space-y-0.5 sm:space-y-1 pl-0.5">
            <div className="h-1 rounded bg-foreground" />
            <div className="h-1 rounded bg-secondary" />
            <div className="h-1 w-2/3 rounded bg-secondary" />
            <div className="mt-1.5 h-1 rounded bg-foreground" />
            <div className="h-1 rounded bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  if (templateId === "ats") {
    return (
      <div className="flex h-20 w-full flex-col rounded border border-border bg-card p-1.5 sm:h-24 sm:p-2 md:h-28 md:p-3">
        <div className="mb-1 text-center space-y-0.5 sm:mb-1.5">
          <div className="mx-auto h-1.5 w-16 rounded-sm sm:w-20" style={{ backgroundColor: accent }} />
          <div className="mx-auto h-1 w-10 rounded-sm bg-foreground" />
          <div className="mx-auto h-[1px] w-2/3 bg-border" />
          <div className="mx-auto mt-0.5 h-[1.5px] w-full" style={{ backgroundColor: accent }} />
          <div className="mx-auto mt-[1px] h-[0.5px] w-full" style={{ backgroundColor: accent }} />
        </div>
        <div className="flex-1 space-y-1.5 px-1 pt-1">
          <div className="space-y-0.5">
            <div className="h-[0.5px] w-full" style={{ backgroundColor: accent }} />
            <div className="mx-auto h-1 w-1/4 rounded-sm" style={{ backgroundColor: accent }} />
            <div className="h-[0.5px] w-full" style={{ backgroundColor: accent }} />
            <div className="h-1 w-full rounded-sm bg-secondary mt-0.5" />
            <div className="h-1 w-5/6 rounded-sm bg-secondary" />
          </div>
          <div className="space-y-0.5">
            <div className="h-[0.5px] w-full" style={{ backgroundColor: accent }} />
            <div className="mx-auto h-1 w-1/4 rounded-sm" style={{ backgroundColor: accent }} />
            <div className="h-[0.5px] w-full" style={{ backgroundColor: accent }} />
            <div className="h-1 w-full rounded-sm bg-secondary mt-0.5" />
            <div className="h-1 w-5/6 rounded-sm bg-secondary" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-20 w-full rounded border border-border bg-card p-1.5 sm:h-24 sm:p-2 md:h-28 md:p-3">
      <div className="mb-1 h-1 w-10 rounded sm:w-14 md:mb-1.5 md:w-20" style={{ backgroundColor: accent }} />
      <div
        className={cn(
          "grid h-12 gap-1 sm:h-14 md:h-18 md:gap-1.5",
          templateId === "sidebar" && "grid-cols-[32px_1fr] sm:grid-cols-[40px_1fr] md:grid-cols-[50px_1fr]"
        )}
      >
        {templateId === "sidebar" && (
          <div className="rounded-sm" style={{ backgroundColor: accent }} />
        )}
        <div className="space-y-0.5 sm:space-y-1">
          <div className="h-1 rounded bg-border" />
          <div className="h-1 rounded bg-secondary" />
          <div className="h-1 w-2/3 rounded bg-secondary" />
          <div className="mt-1.5 h-1 rounded bg-border sm:mt-2" />
          <div className="h-1 rounded bg-secondary" />
        </div>
      </div>
    </div>
  );
};

const TemplateDialog = ({
  open,
  onOpenChange,
  selectedTemplate,
  accent,
  onSelect,
}: TemplateDialogProps) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="mx-auto max-w-[95vw] overflow-hidden p-3 sm:max-w-md md:max-w-xl lg:max-w-2xl sm:p-4 md:p-5 bg-card">
      <DialogHeader className="mb-2 sm:mb-3">
        <DialogTitle className="text-sm sm:text-base md:text-lg text-foreground">Choose a template</DialogTitle>
        <p className="text-[11px] text-muted-foreground sm:text-xs">
          You can change the template at any time.
        </p>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3 md:gap-4">
        {templates.map((template) => (
          <button
            key={template.id}
            className={cn(
              "w-full rounded-lg border-2 p-1.5 text-left transition-colors sm:rounded-xl sm:p-2 md:p-3",
              selectedTemplate === template.id
                ? "border-primary shadow-md"
                : "border-border hover:border-primary"
            )}
            onClick={() => onSelect(template.id)}
          >
            <TemplateThumb templateId={template.id} accent={accent} />
            <div className="mt-1.5 text-center text-[10px] font-bold leading-tight sm:mt-2 sm:text-xs md:text-sm text-foreground">
              {template.label}
            </div>
            <div className="mt-0.5 hidden text-center text-[10px] leading-tight text-muted-foreground sm:block sm:text-[11px]">
              {template.description}
            </div>
          </button>
        ))}
      </div>
    </DialogContent>
  </Dialog>
);

export default TemplateDialog;
