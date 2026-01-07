
import { NutritionalAnalysis, CuratedReplacement } from "../types";

const CURATED_REPLACEMENTS: Record<string, CuratedReplacement[]> = {
  extrato_de_tomate: [
    {
      name: "Passata di Pomodoro Italiana",
      image: "https://images.unsplash.com/photo-1621441312338-9279532588ae?auto=format&fit=crop&q=80&w=400",
      reason: "Feito apenas com tomate e sal. Sem conservantes ou espessantes comuns em extratos industriais.",
      calories: 25,
      ingredients: "Tomates italianos, sal.",
      allergens: { contains_gluten: false },
      portion: { size_g: 60, description: "3 colheres de sopa" },
      nutrition: {
        calories_kcal: 11,
        carbohydrates_g: 3,
        proteins_g: 1,
        total_fat_g: 0,
        saturated_fat_g: 0,
        trans_fat_g: 0,
        fiber_g: 0.6,
        sodium_mg: 89
      },
      daily_value_percentage: {
        calories: 0.5,
        carbohydrates: 1,
        proteins: 2,
        fiber: 2.5,
        sodium: 5
      },
      dimensions: { width_cm: 7, depth_cm: 7, height_cm: 21.5, weight_g: 1000 },
      asin: "B07Y2F6H7P",
      purchase_links: [
        {
          id: "amazon",
          store: "Amazon",
          url: "https://www.amazon.com.br/dp/B07Y2F6H7P",
          price: { amount: 18.90, currency: "BRL" },
          last_checked: "2026-01-07"
        },
        {
          id: "paodeacucar",
          store: "Pão de Açúcar",
          url: "https://www.paodeacucar.com/produto/123456",
          price: { amount: 21.49, currency: "BRL" },
          last_checked: "2026-01-07"
        }
      ],
      price_summary: {
        lowest_price: {
          amount: 18.90,
          currency: "BRL",
          store_id: "amazon",
          url: "https://www.amazon.com.br/dp/B07Y2F6H7P",
          last_checked: "2026-01-07"
        },
        price_range: { min: 18.90, max: 21.49 }
      }
    }
  ],
  molho_de_tomate: [
    {
      name: "Tomate Pelado Cirio",
      image: "https://images.unsplash.com/photo-1590779033100-9f60705a2f3b?auto=format&fit=crop&q=80&w=400",
      reason: "A alternativa mais limpa. Apenas tomates inteiros e suco de tomate. Zero açúcar e amido.",
      calories: 22,
      ingredients: "Tomate, suco de tomate, ácido cítrico.",
      allergens: { contains_gluten: false },
      portion: { size_g: 100, description: "Meia xícara" },
      nutrition: {
        calories_kcal: 22,
        carbohydrates_g: 3.5,
        proteins_g: 1.1,
        total_fat_g: 0.1,
        saturated_fat_g: 0,
        trans_fat_g: 0,
        fiber_g: 0.9,
        sodium_mg: 10
      },
      purchase_links: [
        {
          id: "carrefour",
          store: "Carrefour",
          url: "#",
          price: { amount: 12.50, currency: "BRL" },
          last_checked: "2026-01-07"
        },
        {
          id: "mambo",
          store: "Mambo",
          url: "#",
          price: { amount: 14.90, currency: "BRL" },
          last_checked: "2026-01-07"
        }
      ],
      price_summary: {
        lowest_price: {
          amount: 12.50,
          currency: "BRL",
          store_id: "carrefour",
          url: "#",
          last_checked: "2026-01-07"
        },
        price_range: { min: 12.50, max: 14.90 }
      }
    }
  ],
  passata: [
    {
      name: "Passata Rustica De Cecco",
      image: "https://images.unsplash.com/photo-1621441312338-9279532588ae?auto=format&fit=crop&q=80&w=400",
      reason: "Textura perfeita para molhos sem a necessidade de aditivos químicos.",
      calories: 30,
      ingredients: "Tomate, sal.",
      purchase_links: [
        {
          id: "amazon",
          store: "Amazon",
          url: "#",
          price: { amount: 24.90, currency: "BRL" },
          last_checked: "2026-01-07"
        }
      ],
      price_summary: {
        lowest_price: {
          amount: 24.90,
          currency: "BRL",
          store_id: "amazon",
          url: "#",
          last_checked: "2026-01-07"
        },
        price_range: { min: 24.90, max: 24.90 }
      }
    }
  ]
};

export function getCuratedReplacement(data: NutritionalAnalysis): CuratedReplacement | null {
  const { category, confidence } = data.product_classification;
  
  if (confidence < 0.85) return null;

  const options = CURATED_REPLACEMENTS[category];
  if (!options || options.length === 0) return null;

  return options[0];
}
