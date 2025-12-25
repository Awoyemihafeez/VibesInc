import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from "../types";
import { v4 as uuidv4 } from 'uuid';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface AnalysisResult {
  transactions: Transaction[];
  detectedCurrency?: string;
}

export const analyzeFinancialDocument = async (
  data: string,
  mimeType: string,
  categories: string[] = []
): Promise<AnalysisResult> => {
  try {
    const categoryListStr = categories.length > 0 
        ? categories.join(', ') 
        : 'Food, Transport, Utilities, Housing, Shopping, Entertainment, Health, Income, Transfer, Other';

    const prompt = `
      Analyze this financial document.
      Extract every single transaction row.
      Return a JSON object with:
      1. 'transactions': array of objects with merchant, date, amount, category, type.
      2. 'currency': The 3-letter ISO currency code found in the document (e.g., USD, NGN, EUR).
      
      Extraction Rules:
      - 'merchant': Clean name (no IDs/codes).
      - 'date': YYYY-MM-DD.
      - 'amount': Positive number.
      - 'type': INCOME or EXPENSE.
      - 'category': Categorize into: ${categoryListStr}.
      
      Output strict JSON.
    `;

    let contents;
    if (mimeType === 'text/csv' || mimeType === 'text/plain') {
      contents = { parts: [{ text: `DOCUMENT CONTENT:\n${data}\n\nINSTRUCTIONS:\n${prompt}` }] };
    } else {
      contents = { parts: [{ inlineData: { data: data, mimeType: mimeType } }, { text: prompt }] };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            transactions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  merchant: { type: Type.STRING },
                  date: { type: Type.STRING },
                  amount: { type: Type.NUMBER },
                  category: { type: Type.STRING },
                  type: { type: Type.STRING, enum: ['INCOME', 'EXPENSE'] }
                },
                required: ['merchant', 'amount', 'category', 'type']
              }
            },
            currency: { type: Type.STRING }
          },
          required: ['transactions']
        }
      }
    });

    const parsed = JSON.parse(response.text || '{}');
    const detectedCurrency = parsed.currency;
    
    const transactions = (parsed.transactions || []).map((item: any) => ({
      id: uuidv4(),
      date: item.date || new Date().toISOString().split('T')[0],
      merchant: item.merchant || 'Unknown Merchant',
      amount: item.amount,
      category: item.category || 'Uncategorized',
      type: item.type as TransactionType,
      originalSource: mimeType === 'application/pdf' ? 'pdf' : 'csv',
      detectedCurrency
    }));

    return { transactions, detectedCurrency };
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze document.");
  }
};

export const generateInsights = async (transactions: Transaction[]): Promise<any[]> => {
  if (transactions.length < 5) return [];
  const simplifiedData = transactions.map(t => `${t.date}: ${t.merchant} - ${t.amount} (${t.category})`).join('\n');
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: { parts: [{ text: `History:\n${simplifiedData}\n\nAnalyze for trends, anomalies, and saving tips.` }] },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              message: { type: Type.STRING },
              severity: { type: Type.STRING, enum: ['info', 'warning', 'critical'] }
            }
          }
        }
      }
    });
    return JSON.parse(response.text || '[]').map((p: any) => ({ ...p, id: uuidv4() }));
  } catch (error) {
    return [];
  }
};