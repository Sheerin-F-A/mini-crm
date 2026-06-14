import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateJSON } from '@/lib/gemini';

const CHANNEL_SERVICE_URL = process.env.CHANNEL_SERVICE_URL || 'http://localhost:4000/send';

export async function POST(req: Request) {
  try {
    const { campaignData } = await req.json();

    if (!campaignData) {
      return NextResponse.json({ error: "campaignData is required" }, { status: 400 });
    }

    // 1. Convert the AI-recommended audience string into DB filters
    const prompt = `
      Convert this audience description into JSON filters:
      "${campaignData.audience}"
      
      Fields allowed:
      - city: string
      - minSpend: number
      - maxSpend: number
      - inactiveDays: number
      
      Only include fields strongly implied. Omit others.
    `;

    let filters = await generateJSON<any>(prompt);
    if (!filters) filters = {}; // Fallback to all if parsing fails

    const where: any = {};
    if (filters.city) where.city = { contains: filters.city };
    if (filters.minSpend) where.totalSpend = { gte: filters.minSpend };
    if (filters.maxSpend) where.totalSpend = { ...where.totalSpend, lte: filters.maxSpend };
    if (filters.inactiveDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - filters.inactiveDays);
      where.lastOrderDate = { lt: targetDate };
    }

    // 2. Fetch target customers
    const customers = await prisma.customer.findMany({
      where,
      select: { id: true }
    });

    if (customers.length === 0) {
      return NextResponse.json({ error: "No customers match this audience" }, { status: 400 });
    }

    // 3. Create Campaign in DB
    const campaign = await prisma.campaign.create({
      data: {
        name: `Campaign: ${campaignData.message.subject?.substring(0, 30) || 'Untitled'}`,
        goal: "Generated Goal", // We might not have the original user goal here, but we can pass it if needed
        audienceDescription: campaignData.audience,
        generatedMessage: JSON.stringify(campaignData.message),
        recommendedChannel: campaignData.channelRecommendation.channel,
        predictedRevenue: campaignData.predictions.estimatedRevenue,
        predictedOpenRate: campaignData.predictions.openRate,
        status: "active"
      }
    });

    // 4. Create Communication records and queue requests to Channel Service
    const communicationsData = customers.map(c => ({
      campaignId: campaign.id,
      customerId: c.id,
      channel: campaignData.channelRecommendation.channel,
      status: 'sent' // Initial status before async updates
    }));

    await prisma.communication.createMany({
      data: communicationsData
    });

    // We don't want to block the response while waiting for the channel service 
    // for potentially thousands of customers, so we trigger them asynchronously.
    // In a real app we'd use a queue (SQS, BullMQ), but for this assignment we'll do simple async loops.
    
    // Fire and forget
    setTimeout(async () => {
      for (const c of customers) {
        try {
          await fetch(CHANNEL_SERVICE_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaignId: campaign.id,
              customerId: c.id,
              channel: campaignData.channelRecommendation.channel
            })
          });
        } catch (err: any) {
          console.error(`Failed to trigger channel service for customer ${c.id}:`, err.message);
        }
      }
    }, 0);

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      audienceSize: customers.length
    });

  } catch (error) {
    console.error("Campaign Send Error:", error);
    return NextResponse.json({ error: "Failed to launch campaign" }, { status: 500 });
  }
}
