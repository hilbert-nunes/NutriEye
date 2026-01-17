
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionalAnalysis } from "../types";
import { buildConsumptionGuide } from "./cumsuptionGuide";
import { getCuratedReplacement } from "./replacementService";

export const analyzeLabels = async (base64Images: string[]): Promise<NutritionalAnalysis> => {
  console.log("NutriEye: Iniciando análise científica de rótulos...", { imageCount: base64Images.length });

  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

  const systemInstruction = `
    Você é o NutriEye, um sistema especialista em nutrição brasileira de alta precisão.
    Sua missão é realizar OCR e análise bioquímica/nutricional de rótulos.

    REGRAS OBRIGATÓRIAS:
    1. Você DEVE sempre retornar um objeto JSON válido seguindo exatamente o schema fornecido.
    2. NUNCA retorne uma resposta vazia ou apenas pensamentos (thoughts). O output final deve ser o JSON.
    3. Se os dados estiverem ilegíveis, tente inferir pelo nome do produto ou preencha com valores padrão realistas para a categoria, mas NUNCA deixe de responder o JSON completo.
    4. DIRETRIZES DE CATEGORIZAÇÃO: Classifique rigorosamente em: extrato_de_tomate, molho_de_tomate, passata, bebida_adocada, bebida_zero, snack_salgado, snack_doce, laticinio, embutido ou outros.
    5. ANVISA RDC 429/2020: Use os limites de sódio por 100g: Muito Baixo (≤40mg), Baixo (≤120mg), Moderado (121-400mg), Alto (>400mg).

    PONTUAÇÃO (Score):
    - 90-100: Clean Label (apenas ingredientes naturais).
    - 60-89: Processados com aditivos seguros.
    - 0-59: Ultraprocessados com aditivos críticos (ex: glutamato monossódico, corantes artificiais, gordura trans, conservantes agressivos).
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

    let lastError: any;
    const maxRetries = 3;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        console.log(`NutriEye: Tentativa de análise ${attempt}/${maxRetries}...`);

        const response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: [{
            parts: [
              { text: "Analise rigorosamente estes rótulos e retorne APENAS o JSON da análise científica." },
              ...imageParts
            ]
          }],
          config: {
            systemInstruction,
            responseMimeType: "application/json",
            responseSchema: responseSchema as any,
            temperature: 0,
            topP: 0.1,
            topK: 1,
            // We set a thinking budget to allow reasoning but force an output.
            thinkingConfig: { thinkingBudget: 4000 }
          }
        });

        console.debug(`NutriEye Raw Response (Attempt ${attempt}):`, response);

        // Check for empty response or empty content structure as per user request
        if (!response || !response.candidates || response.candidates.length === 0) {
          throw new Error("API Returned empty response or no candidates.");
        }

        // Check specifically for empty content in the first candidate if possible
        const firstCandidate = response.candidates[0];
        if (!firstCandidate.content || Object.keys(firstCandidate.content).length === 0) {
          throw new Error("API Candidate content is empty (Thinking failed to produce output).");
        }

        const text = response.text;
        if (!text || text.trim() === "") {
          throw new Error("A IA pensou mas não emitiu uma resposta final (texto vazio).");
        }

        const data = JSON.parse(text) as NutritionalAnalysis;

        // Enrich with deterministic logic
        data.consumption_guide = buildConsumptionGuide(data);
        data.curated_replacement = getCuratedReplacement(data);

        return data;

      } catch (error: any) {
        console.warn(`NutriEye: Analysis attempt ${attempt} failed.`, error.message);
        lastError = error;

        if (attempt < maxRetries) {
          const backoff = Math.pow(2, attempt - 1) * 1000 + Math.random() * 500; // Exponential backoff + jitter
          console.log(`NutriEye: Retrying in ${backoff.toFixed(0)}ms...`);
          await new Promise(resolve => setTimeout(resolve, backoff));
        }
      }
    }

    // If we land here, all retries failed
    console.error("NutriEye Service Global Error:", lastError);
    if (lastError?.message?.includes("JSON")) {
      throw new Error("Erro de formatação nos dados da análise. O modelo falhou em estruturar o JSON corretamente após várias tentativas.");
    }
    throw lastError;
  } catch (error: any) {
    // Catch any synchronous errors outside the loop (like imageParts processing, though unlikely)
    // Or re-throw the last error from the loop if it wasn't caught correctly inside (it should be)
    console.error("NutriEye Critical Error:", error);
    throw error;
  }
};

export const analyzeLabelsVercel = async (base64Images: string[]): Promise<NutritionalAnalysis> => {
  console.log("NutriEye: Calling Vercel API for analysis...", { imageCount: base64Images.length });

  try {
    const response = await fetch('/api/analyze', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ base64Images }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `API Error: ${response.status}`);
    }

    const data = await response.json();
    return data as NutritionalAnalysis;
  } catch (error) {
    console.error("NutriEye Service Error:", error);
    throw error;
  }
};