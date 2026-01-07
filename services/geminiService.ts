
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionalAnalysis } from "../types";
import { buildConsumptionGuide } from "./cumsuptionGuide";
import { getCuratedReplacement } from "./replacementService";

export const analyzeLabels = async (base64Images: string[]): Promise<NutritionalAnalysis> => {
  console.log("NutriEye: Iniciando análise científica de rótulos...", { imageCount: base64Images.length });
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const systemInstruction = `
    Você é o NutriEye, um especialista em nutrição brasileiro.
    Sua missão é classificar e analisar rótulos com precisão científica.
    
    DIRETRIZES DE CATEGORIZAÇÃO (CRÍTICO):
    Classifique o produto obrigatoriamente em uma destas categorias:
    - extrato_de_tomate, molho_de_tomate, passata, bebida_adocada, bebida_zero, snack_salgado, snack_doce, laticinio, embutido, outros.
    
    Use confidence >= 0.85 apenas se tiver CERTEZA absoluta baseado na imagem.
    Se for um extrato de tomate industrial, classifique como 'extrato_de_tomate'.
    Se for um molho de tomate pronto ou temperado, classifique como 'molho_de_tomate'.

    DIRETRIZES ANVISA RDC 429/2020:
    - Sódio (100g): Muito Baixo (≤40mg), Baixo (≤120mg), Moderado (121-400mg), Alto (>400mg).
    
    PONTUAÇÃO:
    - Clean Label (até 3 ingredientes naturais): Score 90+.
    - Ultraprocessados com aditivos carcinogênicos (ex: Caramelo IV): Score < 40.
    
    RESPONDA SEMPRE EM PORTUGUÊS (BR) EM JSON.
  `;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      product_name: { type: Type.STRING },
      score: { type: Type.NUMBER },
      summary: { type: Type.STRING },
      product_classification: {
        type: Type.OBJECT,
        properties: {
          category: {
            type: Type.STRING,
            enum: ["extrato_de_tomate", "molho_de_tomate", "passata", "bebida_adocada", "bebida_zero", "snack_salgado", "snack_doce", "laticinio", "embutido", "outros"]
          },
          confidence: { type: Type.NUMBER }
        },
        required: ["category", "confidence"]
      },
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
          },
          required: ["name", "calories", "ingredients_brief"]
        }
      },
      replacements_market: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            name: { type: Type.STRING },
            benefit: { type: Type.STRING }
          },
          required: ["name", "benefit"]
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
              },
              required: ["general_consensus"]
            }
          },
         required: ["name", "warning_level", "short_summary", "technological_function", "scientific_evidence"]
        }
      }
    },
    required: ["product_name", "score", "summary", "product_classification", "macro_analysis", "ingredients_overview", "the_good", "the_bad", "replacements_food", "replacements_market", "deep_dive"]
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
          { text: "Analise estes rótulos e categorize o produto rigorosamente. Use confiança 0.9 se tiver certeza da categoria para substituições curadas." },
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

    const data = JSON.parse(text) as NutritionalAnalysis;
    
    console.log("NutriEye: Resposta da IA processada:", {
      nome: data.product_name,
      categoria: data.product_classification.category,
      confiança: data.product_classification.confidence
    });

    // Enrich with deterministic logic
    data.consumption_guide = buildConsumptionGuide(data);
    data.curated_replacement = getCuratedReplacement(data);

    return data;
  } catch (error) {
    console.error("NutriEye Service Error:", error);
    throw error;
  }
};
