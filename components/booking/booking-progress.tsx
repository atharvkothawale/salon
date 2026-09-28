import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingProgressProps {
  currentStep: number;
  onStepClick: (step: number) => void;
}

const STEPS = [
  { id: 1, name: "Service" },
  { id: 2, name: "Stylist" },
  { id: 3, name: "Date & Time" },
  { id: 4, name: "Details" },
  { id: 5, name: "Review" },
];

export function BookingProgress({ currentStep, onStepClick }: BookingProgressProps) {
  return (
    <div className="w-full">
      {/* Mobile Progress Header */}
      <div className="flex items-center justify-between md:hidden pb-4 mb-6 border-b border-border">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-widest text-accent">
            Step {currentStep} of {STEPS.length}
          </span>
          <h2 className="text-base font-serif font-semibold text-foreground">
            {STEPS[currentStep - 1]?.name}
          </h2>
        </div>
        <div className="flex items-center gap-1">
          {STEPS.map((s) => (
            <div
              key={s.id}
              className={cn(
                "h-1.5 w-6 rounded-full transition-colors",
                s.id === currentStep
                  ? "bg-accent"
                  : s.id < currentStep
                  ? "bg-primary"
                  : "bg-border"
              )}
            />
          ))}
        </div>
      </div>

      {/* Desktop Stepper Indicator */}
      <nav aria-label="Progress" className="hidden md:block mb-10">
        <ol role="list" className="flex items-center justify-between">
          {STEPS.map((step, index) => {
            const isCompleted = step.id < currentStep;
            const isCurrent = step.id === currentStep;

            return (
              <li key={step.name} className="relative flex-1 flex items-center">
                <button
                  type="button"
                  onClick={() => isCompleted && onStepClick(step.id)}
                  disabled={!isCompleted}
                  className={cn(
                    "group flex items-center gap-3 text-left w-full focus:outline-none",
                    isCompleted ? "cursor-pointer" : "cursor-default"
                  )}
                >
                  <span
                    className={cn(
                      "flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold transition-colors border",
                      isCompleted
                        ? "bg-accent text-accent-foreground border-accent"
                        : isCurrent
                        ? "bg-primary text-primary-foreground border-primary shadow-sm"
                        : "bg-card text-muted-foreground border-border"
                    )}
                  >
                    {isCompleted ? <Check className="h-4 w-4" /> : step.id}
                  </span>
                  <div className="flex flex-col">
                    <span className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">
                      Step {step.id}
                    </span>
                    <span
                      className={cn(
                        "text-xs font-serif font-semibold transition-colors",
                        isCurrent
                          ? "text-foreground"
                          : isCompleted
                          ? "text-foreground group-hover:text-accent"
                          : "text-muted-foreground"
                      )}
                    >
                      {step.name}
                    </span>
                  </div>
                </button>

                {/* Connecting Line between steps */}
                {index < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-[2px] w-full mx-4 transition-colors hidden lg:block",
                      isCompleted ? "bg-accent" : "bg-border"
                    )}
                  />
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </div>
  );
}
