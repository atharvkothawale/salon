import React from "react";
import { Clock } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface BusinessHour {
  day_of_week: number;
  is_open: boolean;
  open_time: string;
  close_time: string;
}

const DAY_NAMES = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function formatTime(timeStr: string) {
  if (!timeStr) return "";
  const [hoursStr, minutesStr] = timeStr.split(":");
  let hours = parseInt(hoursStr, 10);
  const minutes = minutesStr || "00";
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  return `${hours}:${minutes} ${ampm}`;
}

export function OpeningHours({ hours }: { hours: BusinessHour[] }) {
  // Sort days starting Monday (1) through Sunday (0)
  const sortedHours = [...hours].sort((a, b) => {
    const dayA = a.day_of_week === 0 ? 7 : a.day_of_week;
    const dayB = b.day_of_week === 0 ? 7 : b.day_of_week;
    return dayA - dayB;
  });

  return (
    <div className="rounded-xl border border-border bg-card p-6 shadow-xs space-y-4">
      <div className="flex items-center gap-2.5 pb-3 border-b border-border/80">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-accent/10 text-accent">
          <Clock className="h-4 w-4" />
        </div>
        <div>
          <h3 className="font-serif text-base font-semibold text-foreground">Salon Operating Hours</h3>
          <p className="text-[11px] text-muted-foreground">Standard weekly appointment schedules</p>
        </div>
      </div>

      <div className="space-y-2.5 text-xs">
        {sortedHours.map((h) => (
          <div
            key={h.day_of_week}
            className="flex items-center justify-between py-1 border-b border-border/40 last:border-0"
          >
            <span className="font-medium text-foreground">{DAY_NAMES[h.day_of_week]}</span>
            {h.is_open ? (
              <span className="text-muted-foreground font-mono">
                {formatTime(h.open_time)} – {formatTime(h.close_time)}
              </span>
            ) : (
              <Badge variant="outline" className="text-[10px] text-muted-foreground bg-muted border-border">
                Closed
              </Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
