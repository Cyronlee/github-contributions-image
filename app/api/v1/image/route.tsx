import { NextRequest, NextResponse } from 'next/server';
import { fetchContributions } from '@/lib/github';
import { renderContributionsImage, renderErrorImage } from '@/lib/render';
import type { ThemeName } from '@/lib/types';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const username = searchParams.get('username');
  const range = searchParams.get('range') || undefined;
  const theme = (searchParams.get('theme') as ThemeName) || 'light';

  // Validate username
  if (!username) {
    const errorImage = await renderErrorImage(
      'Missing required parameter: username',
      theme
    );
    return new Response(errorImage.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }

  // Validate range format if provided
  if (range && !/^\d+(w|m|y)$/.test(range)) {
    const errorImage = await renderErrorImage(
      `Invalid range format: "${range}". Use format like "2w", "6m" or "1y"`,
      theme
    );
    return new Response(errorImage.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }

  // Validate theme
  if (theme && !['light', 'dark'].includes(theme)) {
    const errorImage = await renderErrorImage(
      `Invalid theme: "${theme}". Use "light" or "dark"`,
      theme
    );
    return new Response(errorImage.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
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
      const errorImage = await renderErrorImage(
        `User not found: ${username}`,
        theme
      );
      return new Response(errorImage.body, {
        headers: {
          'Content-Type': 'image/png',
          'Cache-Control': 'public, s-maxage=60',
        },
      });
    }

    const errorImage = await renderErrorImage(
      'Failed to generate contribution image',
      theme
    );
    return new Response(errorImage.body, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, s-maxage=60',
      },
    });
  }
}
