import type React from "react";
import { Label } from "@/components/ui/label";

interface FieldProps {
  label: string;
  className?: string;
  children: React.ReactNode;
}

const Field = ({ label, className, children }: FieldProps) => (
  <div className={className}>
    <Label className="mb-2.5 block text-sm font-semibold text-foreground/90 sm:text-sm tracking-tight leading-tight">
      {label}
    </Label>
    <div className="space-y-1">
      {children}
    </div>
  </div>
);

export default Field;
