import React from "react";
import { LoadingState } from "@/components/shared/loading-state";

export default function AdminLoading() {
  return (
    <div className="container mx-auto px-4 py-16 flex items-center justify-center min-h-[60vh]">
      <LoadingState message="Loading administrative portal..." />
    </div>
  );
}
