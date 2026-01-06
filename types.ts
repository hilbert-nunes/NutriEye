
export interface DeepDiveIngredient {
  name: string;
  warning_level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  short_summary: string;
  technological_function?: string;
  scientific_evidence: {
    cancer_risk?: string;
    hormones?: string;
    general_consensus: string;
  };
}

export interface ReplacementProduct {
  name: string;
  benefit: string;
}

export interface ReplacementRecipe {
  name: string;
  calories: number;
  ingredients_brief: string;
}

export interface NutritionalAnalysis {
  product_name: string;
  score: number; // 0 to 100
  summary: string;
  macro_analysis: {
    calories_protein_ratio: string;
    is_balanced: boolean;
    protein_grams: number;
    calories_total: number;
    fiber_grams?: number;
    sodium_mg_per_100g: number;
    sodium_classification: "muito baixo" | "baixo" | "moderado" | "alto";
    fiber_classification: "pobre" | "fonte" | "alto teor";
    fiber_sodium_feedback: string;
  };
  ingredients_overview: {
    count: number;
    is_ultraprocessed: boolean;
    clean_label: boolean;
    risky_ingredients_found: string[];
  };
  the_good: string[];
  the_bad: string[];
  replacements_food: ReplacementRecipe[];
  replacements_market: ReplacementProduct[];
  deep_dive: DeepDiveIngredient[];
}

export interface AnalysisState {
  images: string[];
  isAnalyzing: boolean;
  result: NutritionalAnalysis | null;
  error: string | null;
}
