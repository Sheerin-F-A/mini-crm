import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const { campaignId, customerId, status } = await req.json();

    if (!campaignId || !customerId || !status) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Find the communication record
    const comm = await prisma.communication.findFirst({
      where: {
        campaignId,
        customerId
      }
    });

    if (comm) {
      // Update the status
      await prisma.communication.update({
        where: { id: comm.id },
        data: { status }
      });
      console.log(`Updated receipt: Campaign ${campaignId}, Customer ${customerId} -> ${status}`);
    } else {
      console.warn(`Receipt warning: No communication record found for Campaign ${campaignId}, Customer ${customerId}`);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Receipt API Error:", error);
    return NextResponse.json({ error: "Failed to process receipt" }, { status: 500 });
  }
}
