import { NextRequest, NextResponse } from 'next/server';
import { kv } from '@vercel/kv';

export async function POST(req: NextRequest) {
  try {
    // Parse the incoming JSON payload
    const body = await req.json();

    // Validate that critical fields exist
    if (!body.company ||!body.job_title) {
      return NextResponse.json(
        { error: 'Invalid payload: Missing company or job_title' },
        { status: 400 }
      );
    }

    // Generate a unique, URL-friendly slug
    const companySlug = body.company.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const uniqueId = Math.random().toString(36).substring(2, 7);
    const slug = `${companySlug}-${uniqueId}`;

    // Store the JSON payload in Vercel KV
    await kv.set(`report:${slug}`, body);

    // Construct the live URL (handles both local testing and Vercel production)
    const baseUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL 
     ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` 
      : 'http://localhost:3000';
    
    const reportUrl = `${baseUrl}/report/${slug}`;

    // Return the URL as a JSON response
    return NextResponse.json({ report_url: reportUrl }, { status: 200 });

  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to process payload or write to Vercel KV' },
      { status: 500 }
    );
  }
}