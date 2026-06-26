import type React from "react";
import { CircleDashed, WandSparkles } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface EditorShellProps {
  title: string;
  children: React.ReactNode;
  onAssist?: () => void;
  isAssisting?: boolean;
}

const EditorShell = ({ title, children, onAssist, isAssisting }: EditorShellProps) => (
  <div>
    <div className="mb-6 flex flex-col gap-3 border-b border-border/40 pb-4 sm:mb-8 sm:flex-row sm:items-center sm:justify-between sm:pb-6">
      <h1 className="text-lg font-bold text-foreground sm:text-xl md:text-2xl tracking-tight font-heading">{title}</h1>
      <div className="flex items-center gap-2">
        {onAssist && (
          <Button
            variant="outline"
            onClick={onAssist}
            disabled={isAssisting}
            className="rounded-xl border-violet-500/30 bg-violet-500/5 text-violet-600 hover:bg-violet-500/10 hover:text-violet-700 font-semibold text-xs sm:text-sm transition-colors"
            size="sm"
          >
            {isAssisting ? (
              <CircleDashed className="mr-1.5 h-3.5 w-3.5 animate-spin" />
            ) : (
              <WandSparkles className="mr-1.5 h-3.5 w-3.5" />
            )}
            AI Assist
          </Button>
        )}
        <Badge className="rounded-xl bg-violet-500/10 text-violet-600 font-semibold text-[10px] sm:text-xs px-2.5 py-0.5">TIPS</Badge>
      </div>
    </div>
    <div className="space-y-5 sm:space-y-6">{children}</div>
  </div>
);

export default EditorShell;
