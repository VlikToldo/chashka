import type { TimeSlot, DayKey } from "../types/admin";

const DAY_ORDER: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];

function areConsecutive(sorted: DayKey[]): boolean {
  for (let i = 1; i < sorted.length; i++) {
    if (DAY_ORDER.indexOf(sorted[i]) !== DAY_ORDER.indexOf(sorted[i - 1]) + 1) return false;
  }
  return true;
}

export function formatSlots(
  slots: TimeSlot[],
  dayLabels: Record<DayKey, string>,
): string[] {
  return slots
    .filter((s) => s.days.length > 0)
    .map((s) => {
      const sorted = [...s.days].sort(
        (a, b) => DAY_ORDER.indexOf(a) - DAY_ORDER.indexOf(b),
      );
      let daysStr: string;
      if (sorted.length === 1) {
        daysStr = dayLabels[sorted[0]];
      } else if (areConsecutive(sorted)) {
        daysStr = `${dayLabels[sorted[0]]} – ${dayLabels[sorted[sorted.length - 1]]}`;
      } else {
        daysStr = sorted.map((d) => dayLabels[d]).join(", ");
      }
      return `${daysStr}: ${s.openTime} – ${s.closeTime}`;
    });
}
