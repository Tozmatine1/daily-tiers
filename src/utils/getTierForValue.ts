// src/utils/getTierForValue.ts

import type { TierDefinition, TierId } from "../types/puzzle";

// Given a stat value and the category's tier definitions,
// return the correct TierId (S, A, B, C, or D).

export function getTierForValue(
  value: number,
  tiers: TierDefinition[]
): TierId {
  for (const tier of tiers) {
    const minOK = tier.minValue === null || value >= tier.minValue;
    const maxOK = tier.maxValue === null || value <= tier.maxValue;

    if (minOK && maxOK) {
      return tier.id;
    }
  }

  // Should never happen if tiers are defined correctly.
  return "D";
}
