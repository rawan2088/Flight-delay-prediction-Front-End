export type Tone = "green" | "amber" | "red";

export const TONE_CLASSES: Record<Tone, string> = {
  green: "bg-emerald-500/15 text-emerald-300 border-emerald-500/30",
  amber: "bg-amber-500/15 text-amber-300 border-amber-500/30",
  red: "bg-rose-500/15 text-rose-300 border-rose-500/30",
};

// Airlines count a flight as "delayed" only after 15 minutes (US DOT rule).
export function describeDelay(min: number): { label: string; tone: Tone } {
  const m = Math.round(Math.abs(min));
  if (min <= 15) {
    return { label: min < -1 ? `${m} min early` : "On time", tone: "green" };
  }
  return { label: `${m} min late`, tone: min <= 45 ? "amber" : "red" };
}
