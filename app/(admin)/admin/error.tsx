"use client";

import React from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function AdminError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="Admin Portal Error"
        message="An unexpected error occurred while processing administrative data. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
