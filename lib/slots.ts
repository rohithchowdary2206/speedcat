export const COURT_TIME_SLOTS = [
  { time: "06:00 AM - 07:00 AM", category: "Early Bird" },
  { time: "07:00 AM - 08:00 AM", category: "Morning" },
  { time: "08:00 AM - 09:00 AM", category: "Morning" },
  { time: "09:00 AM - 10:00 AM", category: "Morning" },
  { time: "05:00 PM - 06:00 PM", category: "Evening" },
  { time: "06:00 PM - 07:00 PM", category: "Prime Time" },
  { time: "07:00 PM - 08:00 PM", category: "Prime Time" },
  { time: "08:00 PM - 09:00 PM", category: "Night Match" },
  { time: "09:00 PM - 10:00 PM", category: "Night Match" },
] as const;

export function getConsecutiveSlots(startSlot: string, durationHours: number): string[] {
  const times: string[] = COURT_TIME_SLOTS.map((s) => s.time as string);
  const startIndex = times.indexOf(startSlot);
  if (startIndex === -1) return [startSlot];
  const slots = times.slice(startIndex, startIndex + durationHours);
  if (slots.length < durationHours) {
    throw new Error("Not enough consecutive slots available after the selected start time.");
  }
  return slots;
}
