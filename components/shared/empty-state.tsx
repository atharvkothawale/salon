import React from "react";
import { FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  icon?: React.ComponentType<{ className?: string }>;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  onAction,
  icon: Icon = FolderOpen,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-dashed border-border rounded-lg bg-card/50">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-secondary text-muted-foreground mb-4">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">{description}</p>
      {actionLabel && onAction && (
        <Button variant="outline" size="sm" onClick={onAction}>
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
