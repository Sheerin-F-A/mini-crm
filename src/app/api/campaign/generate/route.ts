import { NextResponse } from 'next/server';
import { generateJSON } from '@/lib/gemini';

type CampaignGenerationResult = {
  audience: string;
  channelRecommendation: {
    channel: 'WhatsApp' | 'SMS' | 'Email' | 'RCS';
    reason: string;
  };
  message: {
    subject: string;
    body: string;
    cta: string;
  };
  predictions: {
    openRate: number;
    clickRate: number;
    conversionRate: number;
    estimatedRevenue: number;
  };
};

export async function POST(req: Request) {
  try {
    const { goal } = await req.json();

    if (!goal) {
      return NextResponse.json({ error: "Campaign goal is required" }, { status: 400 });
    }

    const prompt = `
      You are an expert AI Campaign Copilot for a marketing CRM.
      The user wants to create a new campaign with the following goal:
      
      Goal: "${goal}"

      Generate a comprehensive campaign strategy. Return the result strictly as a JSON object with the following structure:
      {
        "audience": "A clear, 1-2 sentence description of the recommended target audience for this goal",
        "channelRecommendation": {
          "channel": "WhatsApp" | "SMS" | "Email" | "RCS",
          "reason": "Why this channel is best for this specific goal and audience"
        },
        "message": {
          "subject": "Catchy subject line (if Email) or short heading (if SMS/WhatsApp)",
          "body": "The personalized body of the campaign message",
          "cta": "The Call To Action text (e.g., 'Shop Now', 'Claim Offer')"
        },
        "predictions": {
          "openRate": <number between 10 and 80>,
          "clickRate": <number between 1 and 30>,
          "conversionRate": <number between 1 and 15>,
          "estimatedRevenue": <realistic projected revenue in rupees, e.g. 15000>
        }
      }
    `;

    let generatedCampaign = await generateJSON<CampaignGenerationResult>(prompt);

    // Fallback if Gemini fails or is unconfigured
    if (!generatedCampaign) {
      generatedCampaign = {
        audience: "High-value customers who haven't purchased in the last 60 days.",
        channelRecommendation: {
          channel: "WhatsApp",
          reason: "WhatsApp has the highest engagement rate for time-sensitive win-back offers in India."
        },
        message: {
          subject: "We miss you! Here's 20% off",
          body: "Hi there! It's been a while since your last order. We've added some exciting new products we think you'll love. Use code MISSYOU20 for 20% off your next purchase.",
          cta: "Claim 20% Off Now"
        },
        predictions: {
          openRate: 65,
          clickRate: 18,
          conversionRate: 6,
          estimatedRevenue: 24500
        }
      };
    }

    return NextResponse.json(generatedCampaign);
  } catch (error) {
    console.error("Campaign Generation Error:", error);
    return NextResponse.json({ error: "Failed to generate campaign" }, { status: 500 });
  }
}
