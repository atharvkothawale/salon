import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "An unexpected error occurred while loading this page.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/20 bg-destructive/5 rounded-lg">
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive mb-4">
        <AlertTriangle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-6">{message}</p>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
}
