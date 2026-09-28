"use client";

import React from "react";
import { format, addDays, isSameDay, isToday, isTomorrow } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface DateSelectionProps {
  selectedDate: string; // YYYY-MM-DD
  onSelectDate: (dateStr: string) => void;
}

export function DateSelection({ selectedDate, onSelectDate }: DateSelectionProps) {
  const today = new Date();
  const dateOptions = Array.from({ length: 14 }).map((_, i) => addDays(today, i));

  const [year, month, day] = selectedDate.split("-").map(Number);
  const currentSelectedObj = new Date(year, month - 1, day);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h4 className="font-serif text-lg font-semibold text-foreground flex items-center gap-2">
            <CalendarIcon className="h-4 w-4 text-accent" />
            Select Appointment Date
          </h4>
          <p className="text-xs text-muted-foreground">
            Showing available schedule for {format(currentSelectedObj, "EEEE, MMMM d, yyyy")}
          </p>
        </div>
      </div>

      {/* Date Strip Scroller */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {dateOptions.map((dateObj) => {
          const dateStr = format(dateObj, "yyyy-MM-dd");
          const isSelected = isSameDay(dateObj, currentSelectedObj);
          const dayName = isToday(dateObj)
            ? "TODAY"
            : isTomorrow(dateObj)
            ? "TOMORROW"
            : format(dateObj, "EEE").toUpperCase();

          return (
            <button
              key={dateStr}
              type="button"
              onClick={() => onSelectDate(dateStr)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[72px] px-3 py-3 rounded-xl border transition-all cursor-pointer text-center shrink-0",
                isSelected
                  ? "bg-accent text-accent-foreground border-accent shadow-sm ring-1 ring-accent"
                  : "bg-card text-foreground border-border hover:border-accent/40 hover:bg-secondary/50"
              )}
            >
              <span className={cn("text-[10px] font-bold tracking-wider uppercase", isSelected ? "text-accent-foreground" : "text-muted-foreground")}>
                {dayName}
              </span>
              <span className="font-serif text-lg font-bold leading-tight my-0.5">
                {format(dateObj, "d")}
              </span>
              <span className={cn("text-[10px] font-medium uppercase", isSelected ? "text-accent-foreground/90" : "text-muted-foreground")}>
                {format(dateObj, "MMM")}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
