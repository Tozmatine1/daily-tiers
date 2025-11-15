// src/types/Puzzle.ts

export type TierId = "S" | "A" | "B" | "C" | "D";

export type TierDefinition = {
  id: TierId;
  label: string;
  minValue: number | null; // inclusive lower bound
  maxValue: number | null; // inclusive upper bound
};

export type CategoryConfig = {
  id: string;
  name: string;
  units: string;
  tiers: TierDefinition[];
};

export type Item = {
  id: string;
  name: string;
  value: number; // the stat value (e.g. career points)
};

export type PuzzleItem = Item & {
  trueTier: TierId; // computed from value + TierDefinition ranges
};

export type Puzzle = {
  id: string;            // e.g. "2025-11-15"
  category: CategoryConfig;
  items: PuzzleItem[];
};
