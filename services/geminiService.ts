import { GoogleGenAI, Type } from "@google/genai";
import { Transaction, TransactionType } from "../types";
import { v4 as uuidv4 } from 'uuid';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

// Analyze a document (PDF or Text/CSV content)
export const analyzeFinancialDocument = async (
  data: string,
  mimeType: string,
  categories: string[] = []
): Promise<Transaction[]> => {
  try {
    const categoryListStr = categories.length > 0 
        ? categories.join(', ') 
        : 'Food, Transport, Utilities, Housing, Shopping, Entertainment, Health, Income, Transfer, Other';

    const prompt = `
      Analyze this financial document (Bank Statement, Credit Card Export, or Transaction Log).
      Extract every single transaction row found.
      Return a JSON array of transactions.
      
      Rules:
      1. 'merchant': Clean up the description (remove store IDs, random numbers).
      2. 'date': Use YYYY-MM-DD format. If year is missing, assume current year.
      3. 'amount': Must be a positive number.
      4. 'type': Determine if it is INCOME (Deposit, Salary, Credit) or EXPENSE (Debit, Purchase, Payment).
      5. 'category': Auto-categorize strictly into: ${categoryListStr}.
      
      Output strict JSON.
    `;

    // Construct contents based on input type
    let contents;
    
    if (mimeType === 'text/csv' || mimeType === 'text/plain') {
      contents = {
        parts: [
          { text: `DOCUMENT CONTENT:\n${data}\n\nINSTRUCTIONS:\n${prompt}` }
        ]
      };
    } else {
      contents = {
        parts: [
          { inlineData: { data: data, mimeType: mimeType } },
          { text: prompt }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
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
        }
      }
    });

    const text = response.text;
    if (!text) return [];

    const rawData = JSON.parse(text);
    
    return rawData.map((item: any) => ({
      id: uuidv4(),
      date: item.date || new Date().toISOString().split('T')[0],
      merchant: item.merchant || 'Unknown Merchant',
      amount: item.amount,
      category: item.category || 'Uncategorized',
      type: item.type as TransactionType,
      originalSource: mimeType === 'application/pdf' ? 'pdf' : 'csv'
    }));

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze document. Please ensure it is a valid bank statement.");
  }
};

// Generate Insights/Anomalies based on transaction history
export const generateInsights = async (transactions: Transaction[]): Promise<any[]> => {
  if (transactions.length < 5) return [];

  const prompt = `
    Analyze these financial transactions for anomalies, spending trends, or helpful insights.
    Focus on:
    1. Unusually high spending in a category.
    2. Duplicate charges.
    3. Recommendations for saving.
    Return a list of insights.
  `;

  const simplifiedData = transactions.map(t => `${t.date}: ${t.merchant} - $${t.amount} (${t.category})`).join('\n');

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          { text: `History:\n${simplifiedData}\n\n${prompt}` }
        ]
      },
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

    const text = response.text;
    if (!text) return [];
    
    const parsed = JSON.parse(text);
    return parsed.map((p: any) => ({ ...p, id: uuidv4() }));

  } catch (error) {
    console.warn("Insight generation failed", error);
    return [];
  }
};