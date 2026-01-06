
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionalAnalysis } from "../types";

export const analyzeLabels = async (base64Images: string[]): Promise<NutritionalAnalysis> => {
  console.log("NutriEye: Iniciando análise científica de rótulos...", { imageCount: base64Images.length });
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Você é o NutriEye, um especialista em nutrição brasileiro com foco em ciência e evidências.
    Sua missão é traduzir rótulos SEM praticar terrorismo nutricional.
    
    DIRETRIZES DE ANÁLISE (BASE ANVISA RDC 429/2020):
    1. SÓDIO (referência por 100g):
       - Muito Baixo: ≤ 40mg. (Classifique como "Excelente/Irrelevante", NUNCA dê alerta).
       - Baixo: ≤ 120mg.
       - Moderado: 121mg - 400mg.
       - Alto: > 400mg (sólidos) ou > 200mg (líquidos).
    
    2. ADITIVOS:
       - Diferencie aditivos seguros (ex: Ácido Cítrico, Lecitina de Soja) de aditivos controversos (ex: Caramelo IV, BHA, TBHQ).
       - Aditivos seguros NÃO devem gerar alertas negativos, apenas menção de função tecnológica.
    
    3. PONTUAÇÃO (SCORE):
       - Clean Label (até 3 ingredientes naturais, ex: Tomate Pelado): Mínimo 90.
       - Ultraprocessados com aditivos carcinogênicos: Máximo 40.
    
    4. LINGUAGEM:
       - Evite termos como "perigoso" ou "tóxico" para doses reguladas.
       - Use "evidência científica", "consenso regulatório", "risco associado ao consumo frequente".
    
    RESPONDA EM PORTUGUÊS (BR) EM FORMATO JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      product_name: { type: Type.STRING },
      score: { type: Type.NUMBER },
      summary: { type: Type.STRING },
      macro_analysis: {
        type: Type.OBJECT,
        properties: {
          calories_protein_ratio: { type: Type.STRING },
          is_balanced: { type: Type.BOOLEAN },
          protein_grams: { type: Type.NUMBER },
          calories_total: { type: Type.NUMBER },
          fiber_grams: { type: Type.NUMBER },
          sodium_mg_per_100g: { type: Type.NUMBER },
          sodium_classification: { type: Type.STRING, enum: ["muito baixo", "baixo", "moderado", "alto"] },
          fiber_classification: { type: Type.STRING, enum: ["pobre", "fonte", "alto teor"] },
          fiber_sodium_feedback: { type: Type.STRING }
        },
        required: ["calories_protein_ratio", "is_balanced", "protein_grams", "calories_total", "sodium_mg_per_100g", "sodium_classification", "fiber_sodium_feedback"]
      },
      ingredients_overview: {
        type: Type.OBJECT,
        properties: {
          count: { type: Type.NUMBER },
          is_ultraprocessed: { type: Type.BOOLEAN },
          clean_label: { type: Type.BOOLEAN },
          risky_ingredients_found: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["count", "is_ultraprocessed", "clean_label", "risky_ingredients_found"]
      },
      the_good: { type: Type.ARRAY, items: { type: Type.STRING } },
      the_bad: { type: Type.ARRAY, items: { type: Type.STRING } },
      replacements_food: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            calories: { type: Type.NUMBER },
            ingredients_brief: { type: Type.STRING }
          }
        }
      },
      replacements_market: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            benefit: { type: Type.STRING }
          }
        }
      },
      deep_dive: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            warning_level: { type: Type.STRING, enum: ["safe", "low", "medium", "high", "critical"] },
            short_summary: { type: Type.STRING },
            technological_function: { type: Type.STRING },
            scientific_evidence: {
              type: Type.OBJECT,
              properties: {
                cancer_risk: { type: Type.STRING },
                hormones: { type: Type.STRING },
                general_consensus: { type: Type.STRING }
              }
            }
          }
        }
      }
    },
    required: ["product_name", "score", "summary", "macro_analysis", "ingredients_overview", "the_good", "the_bad", "replacements_food", "replacements_market", "deep_dive"]
  };

  try {
    const imageParts = base64Images.map((img) => ({
      inlineData: {
        data: img.split(',')[1],
        mimeType: 'image/jpeg'
      }
    }));

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: "Analise estes rótulos seguindo as diretrizes científicas e retorne o JSON estruturado." },
          ...imageParts
        ]
      },
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema as any
      }
    });

    const text = response.text;
    if (!text) throw new Error("API retornou vazio.");

    return JSON.parse(text);
  } catch (error) {
    console.error("NutriEye Service Error:", error);
    throw error;
  }
};
