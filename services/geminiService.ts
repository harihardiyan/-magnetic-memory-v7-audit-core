
import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { TrainingLog, TaskType } from "../types";
import { TASK_LABELS } from "../constants";

/**
 * Generates an empirical summary of the model training results using Gemini AI.
 * Follows the latest @google/genai SDK guidelines for world-class implementation.
 */
export const generateEmpiricalSummary = async (
  logs: TrainingLog[],
  task: TaskType,
  seed: number
): Promise<string> => {
  // Use process.env.API_KEY directly as required by the guidelines.
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  
  if (logs.length === 0) {
    return "No training logs available for analysis.";
  }

  const finalLog = logs[logs.length - 1];
  
  const prompt = `
    Analyze the following empirical training results for the MagneticMemory V5 model.
    Task: ${TASK_LABELS[task]}
    Random Seed: ${seed}
    Final Metrics:
    - Loss: ${finalLog.loss.toFixed(4)}
    - Accuracy: ${(finalLog.acc * 100).toFixed(2)}%
    - F1 Score: ${finalLog.f1.toFixed(4)}
    - Coercivities: ${finalLog.coercivities.map(c => c.toFixed(3)).join(", ")}

    Provide a professional, concise scientific summary (max 150 words) regarding the model's domain specialization and memory retention.
  `;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    // Access the text property directly as per the latest SDK spec.
    return response.text || "No analysis generated.";
  } catch (error) {
    console.error("Gemini Error:", error);
    return "Error generating AI analysis.";
  }
};
