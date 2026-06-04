// ============================================================
// Journey Visualization Types
// ============================================================

export interface JourneyState {
  status: "idle" | "playing" | "paused" | "completed";
  progress: number;
  speed: number;
  currentLatlng: [number, number] | null;
  activeSegment: number;
  elapsedMs: number;
}
