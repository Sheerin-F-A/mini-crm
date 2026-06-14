import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { generateJSON } from '@/lib/gemini';

type SegmentFilters = {
  city?: string;
  minSpend?: number;
  maxSpend?: number;
  inactiveDays?: number;
  explanation: string;
};

export async function POST(req: Request) {
  try {
    const { query } = await req.json();

    if (!query) {
      return NextResponse.json({ error: "Query is required" }, { status: 400 });
    }

    const prompt = `
      You are an expert CRM assistant. Convert the following natural language query into structured JSON filters.
      
      Query: "${query}"

      Return a JSON object with the following fields ONLY if they are mentioned or strongly implied.
      Do not include fields that are not part of the query.
      - city: (string) The name of the city.
      - minSpend: (number) Minimum total spend.
      - maxSpend: (number) Maximum total spend.
      - inactiveDays: (number) Number of days since last order (e.g., "haven't ordered in 60 days" = 60).
      - explanation: (string) A brief human-readable explanation of the selected audience based on the query. Example: "Selected because these customers are high spenders from Chennai and have not purchased recently."

      If a field is not applicable, omit it from the JSON.
    `;

    let filters = await generateJSON<SegmentFilters>(prompt);

    // Fallback for missing API Key or failed parsing
    if (!filters) {
      filters = {
        explanation: "AI Parsing failed or GEMINI_API_KEY is not set. Showing a default high-value segment.",
        minSpend: 5000,
        inactiveDays: 60
      };
    }

    // Build Prisma query
    const where: any = {};

    if (filters.city) {
      where.city = { contains: filters.city };
    }
    
    if (filters.minSpend || filters.maxSpend) {
      where.totalSpend = {};
      if (filters.minSpend) where.totalSpend.gte = filters.minSpend;
      if (filters.maxSpend) where.totalSpend.lte = filters.maxSpend;
    }

    if (filters.inactiveDays) {
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() - filters.inactiveDays);
      where.lastOrderDate = { lt: targetDate };
    }

    const [totalCount, sampleCustomers] = await Promise.all([
      prisma.customer.count({ where }),
      prisma.customer.findMany({
        where,
        take: 5,
        orderBy: { totalSpend: 'desc' }
      })
    ]);

    return NextResponse.json({
      filters,
      audienceSize: totalCount,
      sampleCustomers,
      explanation: filters.explanation
    });

  } catch (error) {
    console.error("Segment API Error:", error);
    return NextResponse.json({ error: "Failed to process segment query" }, { status: 500 });
  }
}
