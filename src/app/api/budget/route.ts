import { NextResponse } from "next/server";
import OpenAI from "openai";

export const dynamic = "force-dynamic";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { totalBudget, projectType, targetSavings, lineItems } = await req.json();

  const prompt = `You are a construction cost optimization expert. Analyze this project and suggest specific ways to cut costs.

Project Type: ${projectType}
Total Budget: $${totalBudget}
Target Savings: $${targetSavings}
Line Items: ${lineItems}

Return ONLY a JSON object with this structure:
{
  "totalPotentialSavings": number,
  "suggestions": [
    {
      "category": "string (e.g. Kitchen, Flooring, Electrical)",
      "currentChoice": "string",
      "suggestion": "string (alternative)",
      "savings": number,
      "tradeoff": "string (what you give up)"
    }
  ],
  "summary": "string (2-3 sentences)"
}`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const analysis = JSON.parse(response.choices[0].message.content || "{}");
  return NextResponse.json(analysis);
}