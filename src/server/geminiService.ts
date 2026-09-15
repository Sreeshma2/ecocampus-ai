import { GoogleGenAI, ThinkingLevel } from '@google/genai';

let aiInstance: GoogleGenAI | null = null;

function getAI(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set');
  }
  if (!aiInstance) {
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
}

export async function askGeminiAdvisor(userQuery: string, telemetrySnapshot?: any) {
  const ai = getAI();
  const campusDetails = telemetrySnapshot ? JSON.stringify(telemetrySnapshot, null, 2) : 'Standard campus state: CSE +32% electricity, Hostel +33% water leak.';

  const prompt = `You are EcoCampus AI, the expert Smart Campus Sustainability & Energy Advisor for college hackathon operations.
You specialize in campus energy efficiency, smart sub-metering, water leak detection, and decarbonization strategies.

Campus Telemetry Snapshot:
${campusDetails}

User Question or Request:
"${userQuery}"

Provide a detailed, practical, and data-backed response. Highlight root causes, estimated financial and carbon impacts, and immediate actionable steps. Be professional, clear, and direct.`;

  // As required: model is gemini-3.1-pro-preview, thinkingLevel is ThinkingLevel.HIGH, do NOT set maxOutputTokens.
  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
    },
  });

  return {
    reply: response.text || 'No response generated.',
    model: 'gemini-3.1-pro-preview (High Thinking)',
  };
}

export async function generateAIRecommendationFromGemini(buildingsTelemetry: any[]) {
  const ai = getAI();
  const prompt = `Analyze the current live campus telemetry for buildings:
${JSON.stringify(buildingsTelemetry, null, 2)}

Identify one specific high-priority, realistic energy or water wastage anomaly and generate an actionable AI Recommendation.
Respond with a strictly valid JSON object matching this schema:
{
  "title": "Short descriptive action title (e.g., 'Retrofit Timers on Mechanical Workshop Air Compressors')",
  "buildingName": "Target building name",
  "resource": "electricity" or "water",
  "reason": "Detailed data-backed explanation citing exact telemetry deviations, time of day, and root cause",
  "potentialSavings": "e.g. '350 kWh / Week ($180 / month)' or '8,500 Liters / Day ($240 / month)'",
  "estimatedRoi": "e.g. 'Immediate' or '2 Weeks' or '1 Month'",
  "difficulty": "Quick Win" or "Scheduled Maintenance" or "Operational Policy"
}
Output only the JSON object, without markdown blocks if possible.`;

  const response = await ai.models.generateContent({
    model: 'gemini-3.1-pro-preview',
    contents: prompt,
    config: {
      thinkingConfig: {
        thinkingLevel: ThinkingLevel.HIGH,
      },
      responseMimeType: 'application/json',
    },
  });

  try {
    const raw = response.text || '{}';
    const parsed = JSON.parse(raw);
    return parsed;
  } catch {
    return {
      title: 'Automated Solar Water Preheater Pump Balancing',
      buildingName: 'Hostel Block',
      resource: 'water',
      reason: 'Recirculation pumps are running continuously during low thermal differential periods, causing parasitic pumping loss and localized pressure surges.',
      potentialSavings: '4,500 Liters / Day ($135 / month)',
      estimatedRoi: 'Immediate',
      difficulty: 'Quick Win',
    };
  }
}
