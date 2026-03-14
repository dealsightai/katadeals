import { NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: Request) {
  const { address, price, sqft, bedrooms, bathrooms, notes } = await req.json();

  const prompt = `
    You are a real estate investment analyst. Analyze this deal:
    Address: ${address}
    Price: $${price}
    Size: ${sqft} sqft | ${bedrooms}bd / ${bathrooms}ba
    Notes: ${notes}

    Provide: deal score (1-10), estimated ARV, cash flow estimate, 
    cap rate, red flags, and a buy/hold/pass recommendation.
    Format as JSON.
  `;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    response_format: { type: "json_object" },
  });

  const analysis = JSON.parse(response.choices[0].message.content || "{}");
  return NextResponse.json(analysis);
}
