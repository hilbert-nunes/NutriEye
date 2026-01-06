
import { GoogleGenAI, Type } from "@google/genai";
import { NutritionalAnalysis } from "../types";

export const analyzeLabels = async (base64Images: string[]): Promise<NutritionalAnalysis> => {
  console.log("NutriEye: Iniciando análise de rótulos...", { imageCount: base64Images.length });
  
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  const prompt = `
    Analise as imagens fornecidas de um rótulo de alimento (ingredientes e tabela nutricional). 
    Você é o NutriEye, um especialista em nutrição brasileiro com rigor científico. 
    Responda EXCLUSIVAMENTE em Português do Brasil em formato JSON.
    
    Verifique:
    1. Proporção Caloria/Proteína: Calcule se a densidade proteica é adequada para o total calórico.
    2. Fibras e Sódio: Analise se o produto tem excesso de sódio (sal) ou se é uma boa fonte de fibras. 
       Forneça um feedback textual curto (ex: "Sódio excessivo", "Rico em fibras", "Equilibrado em sódio").
    3. Quantidade e periculosidade dos ingredientes: Aditivos químicos, conservantes, corantes (ex: Caramelo IV).
    4. Identifique substâncias controversas e forneça o "Deep Dive" científico baseado em estudos da IARC (OMS), EFSA ou FDA.
    5. Sugira substituições práticas (receitas simples e produtos similares de mercado mais saudáveis).
    
    Siga rigorosamente este esquema de resposta JSON.
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
          sodium_milligrams: { type: Type.NUMBER },
          fiber_sodium_feedback: { type: Type.STRING, description: "Feedback sobre fibras e sódio" }
        },
        required: ["calories_protein_ratio", "is_balanced", "protein_grams", "calories_total", "fiber_sodium_feedback"]
      },
      ingredients_overview: {
        type: Type.OBJECT,
        properties: {
          count: { type: Type.NUMBER },
          is_ultraprocessed: { type: Type.BOOLEAN },
          risky_ingredients_found: { type: Type.ARRAY, items: { type: Type.STRING } }
        },
        required: ["count", "is_ultraprocessed", "risky_ingredients_found"]
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
            warning_level: { type: Type.STRING },
            short_summary: { type: Type.STRING },
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
    console.log("NutriEye: Mapeando imagens para o modelo...");
    const imageParts = base64Images.map((img, index) => {
      const parts = img.split(',');
      if (parts.length < 2) {
        console.error(`NutriEye: Imagem ${index} inválida (formato base64 incorreto)`);
        throw new Error("Formato de imagem inválido");
      }
      return {
        inlineData: {
          data: parts[1],
          mimeType: 'image/jpeg'
        }
      };
    });

    console.log("NutriEye: Enviando requisição para Gemini 3 Flash...");
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: prompt },
          ...imageParts
        ]
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema as any
      }
    });

    console.log("NutriEye: Resposta recebida da API.");
    const text = response.text;
    
    if (!text) {
      console.error("NutriEye: Resposta da API está vazia.");
      throw new Error("A API retornou uma resposta vazia.");
    }

    const parsedResult = JSON.parse(text);
    console.log("NutriEye: Análise processada com sucesso.", parsedResult);
    return parsedResult;
    
  } catch (error) {
    console.error("NutriEye: Erro durante a análise:", error);
    throw error;
  }
};
