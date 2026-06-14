import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateJSON } from '@/lib/gemini';

export async function GET() {
  try {
    const totalCustomers = await prisma.customer.count();
    const totalOrders = await prisma.order.count();
    const totalCampaigns = await prisma.campaign.count();
    const revenueAggr = await prisma.order.aggregate({ _sum: { amount: true } });
    const totalRevenue = revenueAggr._sum.amount || 0;

    // AI Opportunity Discovery Data Gathering
    const now = new Date();
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);
    const oneEightyDaysAgo = new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000);

    const churnRiskCount = await prisma.customer.count({
      where: { totalSpend: { gt: 5000 }, lastOrderDate: { lt: sixtyDaysAgo } }
    });

    const inactivePremiumCount = await prisma.customer.count({
      where: { totalSpend: { gt: 15000 }, lastOrderDate: { lt: oneEightyDaysAgo } }
    });

    const activeSpendersCount = await prisma.customer.count({
      where: { lastOrderDate: { gte: sixtyDaysAgo } }
    });

    const statsContext = `
      Total Customers: ${totalCustomers}
      Total Revenue: ₹${totalRevenue}
      Segment 1 (High-value at risk of churn - Spent > 5000, inactive > 60 days): ${churnRiskCount} customers
      Segment 2 (Inactive Premium - Spent > 15000, inactive > 180 days): ${inactivePremiumCount} customers
      Segment 3 (Active recent customers): ${activeSpendersCount} customers
    `;

    const prompt = `
      You are an expert marketing AI assistant for a Mini CRM. 
      Analyze the following CRM statistics and generate exactly 2 highly actionable AI opportunities for marketing campaigns.
      
      CRM Statistics:
      ${statsContext}

      Focus on highlighting audience segments with good revenue potential. 
      For potentialRevenue, make a realistic estimate based on the segment size and average ticket size (e.g., if you target 100 people who spent 5000 before, maybe you expect a 10% conversion at 1000 each = 10000).
      
      Return a JSON array where each object has:
      - title: string (A catchy title for the opportunity, e.g., "Win-back Inactive Premium Users")
      - audienceSize: number
      - potentialRevenue: number
      - suggestedAction: string (e.g., "Launch a WhatsApp campaign offering 20% off")
    `;

    type Opportunity = {
      title: string;
      audienceSize: number;
      potentialRevenue: number;
      suggestedAction: string;
    };

    let aiOpportunities = await generateJSON<Opportunity[]>(prompt);

    // Fallback if Gemini isn't configured or fails
    if (!aiOpportunities) {
      aiOpportunities = [
        {
          title: "Win-back At-Risk Customers",
          audienceSize: churnRiskCount,
          potentialRevenue: churnRiskCount * 500, // naive estimate
          suggestedAction: "Launch an email campaign offering a 10% discount on their next purchase."
        },
        {
          title: "Re-engage Inactive Premium Users",
          audienceSize: inactivePremiumCount,
          potentialRevenue: inactivePremiumCount * 1500, // naive estimate
          suggestedAction: "Send a personalized SMS highlighting new premium arrivals."
        }
      ];
    }

    return NextResponse.json({
      totalCustomers,
      totalOrders,
      totalCampaigns,
      totalRevenue,
      aiOpportunities
    });
  } catch (error) {
    console.error("Error fetching stats:", error);
    return NextResponse.json({ error: "Failed to load dashboard stats" }, { status: 500 });
  }
}
