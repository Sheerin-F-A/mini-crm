import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export const dynamic = 'force-dynamic'; // Prevent caching of analytics

export async function GET() {
  try {
    const campaigns = await prisma.campaign.findMany({
      include: {
        communications: {
          select: {
            status: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const analyticsData = campaigns.map(campaign => {
      // Aggregate stats
      let sent = 0;
      let delivered = 0;
      let opened = 0;
      let clicked = 0;
      let converted = 0;
      let failed = 0;

      campaign.communications.forEach(comm => {
        // Our simplified channel service overwrites status:
        // sent -> delivered -> opened -> clicked -> converted
        // So if someone is 'converted', they also implicitly count as clicked, opened, delivered, sent.
        // However, we just aggregate the *current* state of the DB. 
        // To make the funnel look correct, we will assume a waterfall.
        // e.g. If current state is 'opened', it was also 'delivered' and 'sent'.

        sent++; // Everything starts as sent

        if (comm.status === 'failed') {
          failed++;
        }
        
        if (['delivered', 'opened', 'clicked', 'converted'].includes(comm.status)) {
          delivered++;
        }
        
        if (['opened', 'clicked', 'converted'].includes(comm.status)) {
          opened++;
        }
        
        if (['clicked', 'converted'].includes(comm.status)) {
          clicked++;
        }
        
        if (comm.status === 'converted') {
          converted++;
        }
      });

      return {
        id: campaign.id,
        name: campaign.name,
        channel: campaign.recommendedChannel,
        status: campaign.status,
        createdAt: campaign.createdAt,
        audienceSize: campaign.communications.length,
        stats: {
          sent,
          failed,
          delivered,
          opened,
          clicked,
          converted
        }
      };
    });

    return NextResponse.json(analyticsData);
  } catch (error) {
    console.error("Analytics Fetch Error:", error);
    return NextResponse.json({ error: "Failed to load analytics" }, { status: 500 });
  }
}
