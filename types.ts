
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
  image?: string;
}

export interface ReplacementRecipe {
  name: string;
  calories: number;
  ingredients_brief: string;
}

export interface PurchaseLink {
  id: string;
  store: string;
  url: string;
  price: {
    amount: number;
    currency: string;
  };
  last_checked: string;
}

export interface CuratedReplacement {
  name: string;
  image: string;
  reason: string;
  calories?: number;
  ingredients?: string;
  allergens?: {
    contains_gluten: boolean;
    [key: string]: any;
  };
  portion?: {
    size_g: number;
    description: string;
  };
  nutrition?: {
    calories_kcal: number;
    carbohydrates_g: number;
    proteins_g: number;
    total_fat_g: number;
    saturated_fat_g: number;
    trans_fat_g: number;
    fiber_g: number;
    sodium_mg: number;
  };
  daily_value_percentage?: {
    calories: number;
    carbohydrates: number;
    proteins: number;
    fiber: number;
    sodium: number;
  };
  dimensions?: {
    width_cm: number;
    depth_cm: number;
    height_cm: number;
    weight_g: number;
  };
  asin?: string;
  purchase_links?: PurchaseLink[];
  price_summary?: {
    lowest_price: {
      amount: number;
      currency: string;
      store_id: string;
      url: string;
      last_checked: string;
    };
    price_range: {
      min: number;
      max: number;
    };
  };
}

export interface NutritionalAnalysis {
  product_name: string;
  score: number;
  summary: string;
  product_classification: {
    category: "extrato_de_tomate" | "molho_de_tomate" | "passata" | "bebida_adocada" | "bebida_zero" | "snack_salgado" | "snack_doce" | "laticinio" | "embutido" | "outros";
    confidence: number;
  };
  macro_analysis: {
    calories_protein_ratio: string;
    is_balanced: boolean;
    protein_grams: number;
    calories_total: number;
    fiber_grams?: number;
    sodium_mg_per_100g: number;
    sodium_classification: "muito baixo" | "baixo" | "moderado" | "alto";
    sugar_grams?: number;
    saturated_fat_grams?: number;
    fiber_classification: "pobre" | "fonte" | "alto teor";
    fiber_sodium_feedback: string;
  };
  ingredients_overview: {
    count: number;
    is_ultraprocessed: boolean;
    clean_label: boolean;
    risky_ingredients_found: string[];
  };
  consumption_guide: {
    occasional: string;
    frequent: string;
    daily: string;
  };
  the_good: string[];
  the_bad: string[];
  replacements_food: ReplacementRecipe[];
  replacements_market: ReplacementProduct[];
  deep_dive: DeepDiveIngredient[];
  curated_replacement?: CuratedReplacement | null;
}

export interface AnalysisState {
  images: string[];
  isAnalyzing: boolean;
  result: NutritionalAnalysis | null;
  error: string | null;
}
