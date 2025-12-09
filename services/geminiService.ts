import { GoogleGenAI, Type, FunctionDeclaration, Schema, GenerateContentResponse } from "@google/genai";
import { SAFETY_MANUAL_CONTEXT, MOCK_BIM_DATA } from "../constants";

// Helper to get API Key (Env variable handled by environment)
const getAiClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) throw new Error("API Key not found in process.env.API_KEY");
  return new GoogleGenAI({ apiKey });
};

// --- Task A: Invoice Extraction ---

export const analyzeInvoiceImage = async (base64Image: string, mimeType: string) => {
  const ai = getAiClient();
  
  const schema: Schema = {
    type: Type.OBJECT,
    properties: {
      invoice_id: { type: Type.STRING, description: "The invoice number or identifier." },
      vendor_name: { type: Type.STRING, description: "The name of the vendor or supplier." },
      date_issued: { type: Type.STRING, description: "The date the invoice was issued (YYYY-MM-DD)." },
      total_amount: { type: Type.NUMBER, description: "The total amount due." },
      currency: { type: Type.STRING, description: "The currency code (e.g. USD, EUR)." },
      suggested_gl_account: { type: Type.STRING, description: "A suggested General Ledger account code based on the vendor and items (e.g., 5001-Materials, 6002-Services)." },
      confidence_score: { type: Type.NUMBER, description: "A confidence score between 0.0 and 1.0 regarding the extraction accuracy." },
    },
    required: ["vendor_name", "total_amount", "confidence_score", "suggested_gl_account"],
  };

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: {
      parts: [
        { inlineData: { mimeType, data: base64Image } },
        { text: "Extract the following details from this invoice. Return JSON." }
      ]
    },
    config: {
      responseMimeType: "application/json",
      responseSchema: schema,
    }
  });

  return response.text ? JSON.parse(response.text) : null;
};

// --- Task B: BIM Query to Code ---

export const generateBimPythonCode = async (userQuery: string) => {
  const ai = getAiClient();
  
  const systemPrompt = `
    You are a Python Pandas expert assisting a Construction Project Manager.
    You have a DataFrame named 'df_bim' with the following columns:
    - id (string)
    - category (string) e.g., 'Structural Columns', 'Walls'
    - material (string) e.g., 'Concrete', 'Steel'
    - volume (float) in cubic meters
    - length (float) in meters
    - level (string) e.g., 'L1', 'L2'

    The user will ask a question. You must generate a SINGLE line of Python Pandas code to answer it.
    Do not use print(). Just the expression that results in the answer.
    Example Input: "Total volume of concrete"
    Example Output: df_bim[df_bim['material'] == 'Concrete']['volume'].sum()
  `;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: userQuery,
    config: {
      systemInstruction: systemPrompt,
    }
  });

  return response.text;
};

// --- Task C: Risk Prediction (Function Calling) ---

// 1. Tool Definition
const predictCostRiskTool: FunctionDeclaration = {
  name: 'predict_cost_risk',
  description: 'Calculates the probability of cost overrun based on project ID and current spend.',
  parameters: {
    type: Type.OBJECT,
    properties: {
      project_id: { type: Type.STRING, description: "The unique Project ID (e.g., PROJ-001)" },
      current_spend: { type: Type.NUMBER, description: "The current actual spend amount." },
    },
    required: ['project_id', 'current_spend']
  }
};

// 2. The Local Function Logic (Simulating the backend logic)
export const performRiskCalculation = (projectId: string, currentSpend: number) => {
    // Mock Logic: 
    // If spend > 80% of a hypothetical budget of 1M, risk is high.
    // Use a deterministic "random" based on ID for demo consistency.
    const budget = 1000000;
    const spendRatio = currentSpend / budget;
    
    let probability = 0;
    if (spendRatio > 1.1) probability = 95;
    else if (spendRatio > 0.9) probability = 75;
    else if (spendRatio > 0.5) probability = 30 + (Math.random() * 20);
    else probability = 5 + (Math.random() * 10);

    return {
        probability: Math.round(probability),
        status: probability > 80 ? 'Critical' : probability > 50 ? 'High' : 'Low'
    };
};

// 3. The Gemini Interaction Flow
export const assessProjectRisk = async (projectId: string, currentSpend: number) => {
  const ai = getAiClient();
  
  // First turn: User asks, Model calls tool
  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    config: {
      tools: [{ functionDeclarations: [predictCostRiskTool] }]
    }
  });

  const prompt = `Assess the risk for Project ${projectId} with a current spend of $${currentSpend}. Use the available tool.`;
  
  let response = await chat.sendMessage({ message: prompt });
  
  // Check for tool call
  const calls = response.functionCalls;
  if (calls && calls.length > 0) {
    const call = calls[0];
    if (call.name === 'predict_cost_risk') {
       // Execute local logic
       const args = call.args as any;
       const result = performRiskCalculation(args.project_id, args.current_spend);
       
       // Send result back to Gemini
       response = await chat.sendMessage({
         message: [{
           toolResponse: {
             functionResponses: [{
               name: 'predict_cost_risk',
               id: call.id,
               response: { result: result }
             }]
           }
         }]
       });
       
       return {
         text: response.text,
         data: result
       };
    }
  }

  return { text: response.text, data: null };
};


// --- Task D: Compliance Chat (RAG) ---

export const sendComplianceMessage = async (history: any[], newMessage: string) => {
  const ai = getAiClient();
  
  const systemInstruction = `
    You are a Senior Internal Auditor and Safety Compliance Assistant for a Construction Firm.
    Your goal is to answer questions strictly based on the provided "Project Alpha Quality Control & Safety Manual" context below.
    
    CONTEXT:
    ${SAFETY_MANUAL_CONTEXT}

    RULES:
    1. If the answer is found in the context, cite the Section number.
    2. If the answer is NOT in the context, state "I cannot find this information in the current safety manual."
    3. Be professional, concise, and authoritative.
  `;

  const chat = ai.chats.create({
    model: 'gemini-2.5-flash',
    history: history,
    config: {
      systemInstruction: systemInstruction,
    }
  });

  const result = await chat.sendMessage({ message: newMessage });
  return result.text;
};
