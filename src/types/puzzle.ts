// src/types/puzzle.ts

// All valid tier IDs your app supports
export type TierId = "S" | "A" | "B" | "C" | "D";

// A single tier definition inside a puzzle category
export type TierDefinition = {
  id: TierId;
  label: string;
  minValue: number | null; // inclusive lower bound
  maxValue: number | null; // inclusive upper bound (or null for open-ended)
};

// The category config for each puzzle (e.g., "NBA Career Points")
export type CategoryConfig = {
  id: string;
  name: string;
  units: string;
  tiers: TierDefinition[];
};

// Base item (before computing true tier)
export type Item = {
  id: string;
  name: string;
  value: number; // numerical stat value
};

// Final puzzle item with the assigned correct tier
export type PuzzleItem = Item & {
  trueTier: TierId;
};

// Full daily puzzle structure
export type Puzzle = {
  id: string;                // e.g. "2025-11-18"
  category: CategoryConfig;  // category + tier definitions
  items: PuzzleItem[];       // list of items for that day
};
