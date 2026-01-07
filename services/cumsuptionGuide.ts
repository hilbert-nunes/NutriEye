// lib/consumptionGuide.ts
import { NutritionalAnalysis } from "../types";

export function buildConsumptionGuide(data: NutritionalAnalysis) {
  const sodium = data.macro_analysis.sodium_mg_per_100g || 0;
  const ultraprocessed = data.ingredients_overview.is_ultraprocessed;
  const sugar = data.macro_analysis.sugar_grams || 0;

  const LOW_SODIUM = 120;
  const HIGH_SODIUM = 400;
  const MOD_SUGAR = 10;

  return {
    occasional: "Uso tranquilo dentro de uma alimentação equilibrada.",

    frequent: ultraprocessed
      ? "Evite o consumo frequente devido ao grau de processamento."
      : sodium > HIGH_SODIUM
        ? `Atenção ao consumo frequente pelo alto teor de sódio (${sodium}mg).`
        : sugar > MOD_SUGAR
          ? "Moderado em açúcar, pode fazer parte da rotina se intercalado."
          : "Boa base para o dia a dia.",

    daily: ultraprocessed
      ? "Prefira alimentos in natura para consumo diário."
      : sodium < LOW_SODIUM && sugar < 5
        ? "Excelente opção para consumo diário."
        : sodium < HIGH_SODIUM && sugar < MOD_SUGAR
          ? "Pode ser consumido diariamente em porções controladas."
          : "Para consumo diário, prefira versões com menos sal/açúcar."
  };
}
