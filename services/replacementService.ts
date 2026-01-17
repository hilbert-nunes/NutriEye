
import { NutritionalAnalysis, CuratedReplacement } from "../types";

import curatedReplacementsData from "../data/curated_replacements.json";

const CURATED_REPLACEMENTS: Record<string, CuratedReplacement[]> = curatedReplacementsData as unknown as Record<string, CuratedReplacement[]>;

export function getCuratedReplacement(data: NutritionalAnalysis): CuratedReplacement | null {
  const { category, confidence } = data.product_classification;

  if (confidence < 0.85) return null;

  const options = CURATED_REPLACEMENTS[category];
  if (!options || options.length === 0) return null;

  return options[0];
}
