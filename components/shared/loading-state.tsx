import React from "react";
import { Loader2 } from "lucide-react";

interface LoadingStateProps {
  message?: string;
}

export function LoadingState({ message = "Loading content..." }: LoadingStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center">
      <Loader2 className="h-8 w-8 animate-spin text-accent mb-3" />
      <p className="text-xs text-muted-foreground">{message}</p>
    </div>
  );
}
