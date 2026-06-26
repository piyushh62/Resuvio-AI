import type React from "react";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface EntryListProps<T> {
  items: T[];
  label: string;
  addLabel: string;
  onAdd: () => void;
  onRemove: (index: number) => void;
  render: (item: T, index: number) => React.ReactNode;
}

function EntryList<T>({
  items,
  label,
  addLabel,
  onAdd,
  onRemove,
  render,
}: EntryListProps<T>) {
  return (
    <div className="space-y-4 sm:space-y-6">
      {items.map((item, index) => (
        <Card key={index} className="border border-border/40 bg-secondary/30 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardContent className="p-4 sm:p-6">
            <div className="mb-4 flex items-center justify-between sm:mb-5">
              <div className="text-xs font-bold uppercase tracking-wide text-muted-foreground sm:text-sm">
                {label} #{index + 1}
              </div>
              {items.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive/90"
                  onClick={() => onRemove(index)}
                >
                  <Trash2 className="mr-1 h-3 w-3 sm:mr-2 sm:h-4 sm:w-4" />
                  <span className="hidden sm:inline">Remove</span>
                </Button>
              )}
            </div>
            {render(item, index)}
          </CardContent>
        </Card>
      ))}
      <Button variant="outline" className="w-full border-dashed border-border/50 bg-secondary/10 hover:bg-secondary/50 py-4 sm:py-6 rounded-xl transition-all hover:border-violet-500/50 hover:text-violet-600" onClick={onAdd}>
        <Plus className="mr-2 h-4 w-4" /> {addLabel}
      </Button>
    </div>
  );
}

export default EntryList;
