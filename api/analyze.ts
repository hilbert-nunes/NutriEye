
import { GoogleGenAI, Type } from "@google/genai";

export default async function handler(req, res) {
    // Configurar CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const { base64Images } = req.body;

        if (!base64Images || !Array.isArray(base64Images)) {
            return res.status(400).json({ error: 'Missing base64Images array' });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing via process.env");
            return res.status(500).json({ error: 'Server configuration error' });
        }

        const ai = new GoogleGenAI({ apiKey });

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
                        sugar_grams: { type: Type.NUMBER },
                        saturated_fat_grams: { type: Type.NUMBER },
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
            required: ["product_name", "score", "summary", "macro_analysis", "ingredients_overview", "the_good", "the_bad", "replacements_food", "replacements_market", "deep_dive"]
        };

        const imageParts = base64Images.map((img) => ({
            inlineData: {
                data: img.split(',')[1],
                mimeType: 'image/jpeg'
            }
        }));

        const response = await ai.models.generateContent({
            model: 'gemini-2.0-flash',
            contents: {
                parts: [
                    { text: "Analise estes rótulos seguindo as diretrizes científicas e retorne o JSON estruturado." },
                    ...imageParts
                ]
            },
            config: {
                systemInstruction,
                responseMimeType: "application/json",
                responseSchema: responseSchema
            }
        });

        const text = response.text;
        if (!text) throw new Error("API retornou vazio.");

        const data = JSON.parse(text);

        // --- BUSINESS LOGIC: Consumption Guide Calculation ---
        const sodium = data.macro_analysis.sodium_mg_per_100g || 0;
        const ultraprocessed = data.ingredients_overview.is_ultraprocessed;
        const sugar = data.macro_analysis.sugar_grams || 0;
        // Basic limits (approximations based on health guidelines)
        const LOW_SODIUM = 120;
        const HIGH_SODIUM = 400;
        const MOD_SUGAR = 10;

        let guide = {
            occasional: "Uso tranquilo dentro de uma alimentação equilibrada.",
            frequent: "",
            daily: ""
        };

        // Frequent Logic
        if (ultraprocessed) {
            guide.frequent = "Evite o consumo frequente devido ao grau de processamento.";
        } else if (sodium > HIGH_SODIUM) {
            guide.frequent = `Atenção ao consumo frequente pelo alto teor de sódio (${sodium}mg).`;
        } else if (sugar > MOD_SUGAR) {
            guide.frequent = "Moderado em açúcar, pode fazer parte da rotina se intercalado com opções frescas.";
        } else {
            guide.frequent = "Boa base para o dia a dia, especialmente pela composição limpa.";
        }

        // Daily Logic
        if (ultraprocessed) {
            guide.daily = "Prefira alimentos in natura para consumo diário.";
        } else if (sodium < LOW_SODIUM && sugar < 5) {
            guide.daily = "Excelente opção para consumo diário, sem impacto negativo relevante.";
        } else if (sodium < HIGH_SODIUM && sugar < MOD_SUGAR) {
            guide.daily = "Pode ser consumido diariamente em porções controladas.";
        } else {
            guide.daily = "Para consumo diário, considere alternar com versões com menos sal/açúcar.";
        }

        data.consumption_guide = guide;
        // -----------------------------------------------------

        return res.status(200).json(data);

    } catch (error) {
        console.error("API Error:", error);
        return res.status(500).json({ error: 'Internal Server Error', details: error.message });
    }
}
