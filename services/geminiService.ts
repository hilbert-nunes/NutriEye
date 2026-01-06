
import { NutritionalAnalysis } from "../types";

export const analyzeLabels = async (base64Images: string[]): Promise<NutritionalAnalysis> => {
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
