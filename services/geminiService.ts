import { GoogleGenAI } from "@google/genai";
import { fileToBase64 } from "../utils/fileUtils";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

const singleDocPrompt = `
You are a helpful medical assistant AI named Purus. Your task is to analyze a medical document (which could be a prescription, lab report, ECG, scan, etc.) and generate a simple, easy-to-understand summary for a patient.

**Instructions:**
1.  **Do Not Provide Medical Advice:** Start your response with a clear disclaimer: "This is an AI-generated summary and not a substitute for professional medical advice. Please consult your doctor for any health concerns."
2.  **Structure the Report:** Organize the output in clear sections using Markdown. Use the following headings:
    *   ### Document Type
    *   ### Key Summary
    *   ### Detailed Breakdown
    *   ### Recommendations & Next Steps
3.  **Simplify Language:** Avoid jargon. Explain complex terms in plain language.
4.  **Analyze Content:**
    *   **For Lab Reports:** Identify values that are outside the normal range. Explain what these markers generally relate to in simple terms.
    *   **For Prescriptions:** List each medication, its purpose, dosage, and frequency clearly in a table.
    *   **For other documents (ECG, Scans):** Summarize the findings mentioned in the report.
5.  **Maintain a supportive and clear tone.**
`;

const symptomsPromptSection = (symptoms: string) => `
6.  **Symptom Analysis:** The user has reported the following symptoms: "${symptoms}". Please add a section titled "### Symptom Analysis" where you analyze these symptoms in the context of the provided medical document. Discuss potential correlations or points of discussion for their doctor, while reiterating that this is not a medical diagnosis.
`;


const trendAnalysisPrompt = (symptoms?: string) => `
You are a helpful medical assistant AI named Purus. Your task is to analyze a series of medical documents provided over time and generate a comprehensive health trend report for a patient.
${symptoms ? `You should also consider the user's current symptoms: "${symptoms}"` : ''}

**Instructions:**
1.  **Do Not Provide Medical Advice:** Start your response with a clear disclaimer: "This is an AI-generated summary and not a substitute for professional medical advice. Please consult your doctor for any health concerns."
2.  **Summarize Latest Document:** First, provide a summary of the most recent document (based on content and filenames if possible), following the structure for a single document analysis (Document Type, Key Summary, Detailed Breakdown).
3.  **Introduce Trend Analysis Section:** After the summary of the latest document, you MUST insert a special separator on its own line: \`---NEW_PAGE---\`. This is critical for formatting the downloadable report.
4.  **Structure the Trend Analysis:** After the separator, create the trend analysis report with the following Markdown headings:
    *   ### Health Trend Analysis
    *   #### Key Changes Over Time
        *   Analyze all provided documents chronologically.
        *   Highlight significant changes in lab results (e.g., rising/falling levels of specific markers), changes in prescriptions (new medications, dosage adjustments), and findings from scans or other reports. Use bullet points for clarity.
    *   #### Visual Trend Spotlight
        *   Create a Markdown table for one or two of the most significant changing lab markers. The table should show the date (if available in the document) and the value.
    *   #### Potential Areas for Discussion
        *   Based on the trends, suggest topics the user might want to discuss with their doctor. Do not give advice, but frame them as questions or discussion points.
${symptoms ? `
    *   #### Symptom Correlation
        *   Briefly discuss if any of the observed trends could be related to the reported symptoms, framing this as a point for discussion with a healthcare professional.
` : ''}
5.  **Maintain a supportive and clear tone throughout.**
`;


const getFileParts = async (files: File[]) => {
    const filePromises = files.map(async (file) => {
        const base64Data = await fileToBase64(file);
        return {
            inlineData: {
                data: base64Data,
                mimeType: file.type,
            },
        };
    });
    return Promise.all(filePromises);
};


export const analyzeDocument = async (file: File, symptoms?: string): Promise<string> => {
  const fileParts = await getFileParts([file]);
  
  let currentPrompt = singleDocPrompt;
  if (symptoms) {
      currentPrompt += symptomsPromptSection(symptoms);
  }

  const textPart = { text: currentPrompt };

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts: [textPart, ...fileParts] },
    });
    
    return response.text;
  } catch (error) {
    console.error("Gemini API call failed:", error);
    if (error instanceof Error && error.message.includes('429')) {
      throw new Error("Too many requests. Please wait a moment and try again.");
    }
    throw new Error("Failed to analyze the document with AI. Please check the file and try again.");
  }
};


export const analyzeHealthTrend = async (files: File[], symptoms?: string): Promise<string> => {
    const fileParts = await getFileParts(files);
    const textPart = { text: trendAnalysisPrompt(symptoms) };

    try {
        const response = await ai.models.generateContent({
            model,
            contents: { parts: [textPart, ...fileParts] },
        });

        return response.text;
    } catch (error) {
        console.error("Gemini API call for trend analysis failed:", error);
        if (error instanceof Error && error.message.includes('429')) {
            throw new Error("Too many requests. Please wait a moment and try again.");
        }
        throw new Error("Failed to analyze health trends with AI. Please check the files and try again.");
    }
};