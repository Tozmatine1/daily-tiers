// src/data/nbaCareerPoints.ts

import type { CategoryConfig, Puzzle, PuzzleItem } from "../types/Puzzle";
import { getTierForValue } from "../utils/getTierForValue";


// Category config: defines what S/A/B/C/D mean in terms of points
export const NBA_CAREER_POINTS: CategoryConfig = {
  id: "nba_career_points",
  name: "NBA – Career Points",
  units: "points",
  tiers: [
    { id: "S", label: "S Tier", minValue: 35000, maxValue: null },
    { id: "A", label: "A Tier", minValue: 30000, maxValue: 34999 },
    { id: "B", label: "B Tier", minValue: 20000, maxValue: 29999 },
    { id: "C", label: "C Tier", minValue: 10000, maxValue: 19999 },
    { id: "D", label: "D Tier", minValue: 0, maxValue: 9999 },
  ],
};

// Raw items (stat values are hard-coded for now)
const rawItems = [
  { id: "lebron", name: "LeBron James", value: 39000 },
  { id: "kareem", name: "Kareem Abdul-Jabbar", value: 38387 },
  { id: "dirk", name: "Dirk Nowitzki", value: 31560 },
  { id: "melo", name: "Carmelo Anthony", value: 28289 },
  { id: "kd", name: "Kevin Durant", value: 27000 },
  { id: "harden", name: "James Harden", value: 25300 },
  { id: "shaq", name: "Shaquille O'Neal", value: 28596 },
  { id: "westbrook", name: "Russell Westbrook", value: 25000 },
  { id: "cp3", name: "Chris Paul", value: 16000 },
  { id: "ginobili", name: "Manu Ginobili", value: 14043 },
];

// Map raw items → puzzle items with computed trueTier
const puzzleItems: PuzzleItem[] = rawItems.map((item) => ({
  ...item,
  trueTier: getTierForValue(item.value, NBA_CAREER_POINTS.tiers),
}));

// Today's puzzle (for now we're hard-coding one)
export const TodayPuzzle: Puzzle = {
  id: "2025-11-15",
  category: NBA_CAREER_POINTS,
  items: puzzleItems,
};
