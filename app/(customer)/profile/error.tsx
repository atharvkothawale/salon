"use client";

import React from "react";
import { ErrorState } from "@/components/shared/error-state";

export default function ProfileError({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <ErrorState
        title="Failed to Load Profile"
        message="An error occurred while retrieving your account details. Please try again."
        onRetry={reset}
      />
    </div>
  );
}
