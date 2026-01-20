import { NextRequest, NextResponse } from 'next/server';
import { fetchContributions } from '@/lib/github';
import { renderContributionsImage } from '@/lib/render';
import type { ThemeName } from '@/lib/types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const range = searchParams.get('range') || undefined;
  const theme = (searchParams.get('theme') as ThemeName) || 'light';

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

  // Validate theme
  if (theme && !['light', 'dark'].includes(theme)) {
    return NextResponse.json(
      { error: 'Invalid theme. Use "light" or "dark"' },
      { status: 400 }
    );
  }

  try {
    const data = await fetchContributions(username, range);
    const imageResponse = await renderContributionsImage({
      data,
      theme,
    });

    // Add caching headers
    const response = new Response(imageResponse.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400',
      },
    });

    return response;
  } catch (error) {
    console.error('Error generating image:', error);

    if (error instanceof Error && error.message.includes('404')) {
      return NextResponse.json(
        { error: `User not found: ${username}` },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to generate contribution image' },
      { status: 500 }
    );
  }
}
