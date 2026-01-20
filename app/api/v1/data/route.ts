import { NextRequest, NextResponse } from 'next/server';
import { fetchContributions } from '@/lib/github';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const range = searchParams.get('range') || undefined;

  if (!username) {
    return NextResponse.json(
      { error: 'Missing required parameter: username' },
      { status: 400 }
    );
  }

  // Validate range format if provided
  if (range && !/^\d+(m|y)$/.test(range)) {
    return NextResponse.json(
      { error: 'Invalid range format. Use format like "6m" or "1y"' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchContributions(username, range);

    return NextResponse.json(data, {
      headers: {
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });
  } catch (error) {
    console.error('Error fetching contributions:', error);

    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: `User not found: ${username}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to fetch contribution data' },
      { status: 500 }
    );
  }
}
