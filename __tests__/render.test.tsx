import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderContributionsImage, organizeContributions, calculateImageDimensions } from '@/lib/render';
import { mockContributionsData, generateMockContributions } from './fixtures/contributions';

// Mock @vercel/og for testing
vi.mock('@vercel/og', () => ({
  ImageResponse: vi.fn().mockImplementation((_element, options) => ({
    body: new ReadableStream(),
    headers: new Headers({ 'content-type': 'image/png' }),
    status: 200,
    width: options?.width ?? 800,
    height: options?.height ?? 400,
  })),
}));

describe('renderContributionsImage', () => {
  it('should render image with default light theme', async () => {
    const result = await renderContributionsImage({
      data: mockContributionsData,
    });

    expect(result).toBeDefined();
    expect(result).toHaveProperty('body');
  });

  it('should render image with dark theme', async () => {
    const result = await renderContributionsImage({
      data: mockContributionsData,
      theme: 'dark',
    });

    expect(result).toBeDefined();
  });

  it('should handle empty contributions', async () => {
    const emptyData = {
      total: 0,
      range: {
        start: '2026-01-01',
        end: '2026-01-01',
      },
      contributions: [],
    };

    const result = await renderContributionsImage({
      data: emptyData,
    });

    expect(result).toBeDefined();
  });

  it('should handle large date ranges', async () => {
    const largeData = generateMockContributions('2025-01-01', '2026-01-20');

    const result = await renderContributionsImage({
      data: largeData,
    });

    expect(result).toBeDefined();
  });
});

describe('organizeContributions', () => {
  it('should return empty arrays for empty contributions', () => {
    const result = organizeContributions([]);
    expect(result.weeks).toEqual([]);
    expect(result.months).toEqual([]);
  });

  it('should organize contributions into weeks', () => {
    const result = organizeContributions(mockContributionsData.contributions);

    expect(result.weeks.length).toBeGreaterThan(0);
    // Each week should have 7 days
    for (const week of result.weeks) {
      expect(week.length).toBe(7);
    }
  });

  it('should track month changes', () => {
    const multiMonthData = generateMockContributions('2025-11-01', '2026-01-20');
    const result = organizeContributions(multiMonthData.contributions);

    // Should have entries for Nov, Dec, Jan
    expect(result.months.length).toBeGreaterThanOrEqual(3);
  });

  it('should map contributions to correct dates', () => {
    const result = organizeContributions(mockContributionsData.contributions);

    // Find a week containing one of our known dates
    let foundContrib = false;
    for (const week of result.weeks) {
      for (const day of week) {
        if (day && day.date === '2025-07-05') {
          expect(day.level).toBe(4);
          expect(day.count).toBe(12);
          foundContrib = true;
        }
      }
    }
    expect(foundContrib).toBe(true);
  });
});

describe('calculateImageDimensions', () => {
  it('should calculate dimensions for contributions', () => {
    const dims = calculateImageDimensions(mockContributionsData);

    expect(dims.width).toBeGreaterThan(0);
    expect(dims.height).toBeGreaterThan(0);
  });

  it('should scale with number of weeks', () => {
    const smallData = generateMockContributions('2026-01-01', '2026-01-14');
    const largeData = generateMockContributions('2025-01-01', '2026-01-20');

    const smallDims = calculateImageDimensions(smallData);
    const largeDims = calculateImageDimensions(largeData);

    expect(largeDims.width).toBeGreaterThan(smallDims.width);
  });

  it('should have consistent height regardless of data length', () => {
    const smallData = generateMockContributions('2026-01-01', '2026-01-14');
    const largeData = generateMockContributions('2025-01-01', '2026-01-20');

    const smallDims = calculateImageDimensions(smallData);
    const largeDims = calculateImageDimensions(largeData);

    // Height should be the same (based on 7 days per week)
    expect(smallDims.height).toBe(largeDims.height);
  });
});
