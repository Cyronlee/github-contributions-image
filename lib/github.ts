import * as cheerio from 'cheerio';
import type { Contribution, ContributionsData } from './types';

interface YearLink {
  href: string;
  text: string;
}

/**
 * Fetch available years from GitHub contributions page
 */
async function fetchYears(username: string): Promise<YearLink[]> {
  const response = await fetch(
    `https://github.com/${username}?tab=contributions`,
    {
      headers: {
        'x-requested-with': 'XMLHttpRequest',
      },
    }
  );

  if (!response.ok) {
    throw new Error(`Failed to fetch GitHub data: ${response.status}`);
  }

  const body = await response.text();
  const $ = cheerio.load(body);

  return $('.js-year-link.filter-item')
    .get()
    .map((a) => {
      const $a = $(a);
      const href = $a.attr('href') || '';
      const githubUrl = new URL(`https://github.com${href}`);
      githubUrl.searchParams.set('tab', 'contributions');
      const formattedHref = `${githubUrl.pathname}${githubUrl.search}`;

      return {
        href: formattedHref,
        text: $a.text().trim(),
      };
    });
}

/**
 * Fetch contribution data for a specific year
 */
async function fetchDataForYear(
  url: string
): Promise<{ contributions: Contribution[]; total: number }> {
  const response = await fetch(`https://github.com${url}`, {
    headers: {
      'x-requested-with': 'XMLHttpRequest',
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch year data: ${response.status}`);
  }

  const body = await response.text();
  const $ = cheerio.load(body);

  const $days = $(
    'table.ContributionCalendar-grid td.ContributionCalendar-day'
  );

  // Extract total contributions
  const contribText = $('.js-yearly-contributions h2')
    .text()
    .trim()
    .match(/^([0-9,]+)\s/);

  let total = 0;
  if (contribText) {
    total = parseInt(contribText[1].replace(/,/g, ''), 10);
  }

  const contributions: Contribution[] = $days
    .get()
    .map((day) => {
      const $day = $(day);
      const date = $day.attr('data-date');
      const level = parseInt($day.attr('data-level') || '0', 10);

      if (!date) return null;

      // Try to get count from tooltip or aria-label
      const tooltipId = $day.attr('aria-describedby');
      let count = 0;

      if (tooltipId) {
        const tooltipText = $(`#${tooltipId}`).text();
        const countMatch = tooltipText.match(/(\d+)\s+contribution/i);
        if (countMatch) {
          count = parseInt(countMatch[1], 10);
        }
      }

      // Fallback: estimate count from level if tooltip not available
      if (count === 0 && level > 0) {
        // Rough estimation based on level
        const levelCounts = [0, 1, 3, 6, 10];
        count = levelCounts[level] || level;
      }

      return {
        date,
        count,
        level,
      };
    })
    .filter((c): c is Contribution => c !== null);

  return { contributions, total };
}

/**
 * Adjust date to the previous Monday (or same day if already Monday)
 * This ensures the chart always starts from a Monday for proper alignment
 */
function adjustToMonday(date: Date): Date {
  const day = date.getDay();
  // Sunday is 0, Monday is 1, etc.
  // If it's Sunday (0), go back 6 days
  // If it's Monday (1), stay
  // If it's Tuesday (2), go back 1 day, etc.
  const daysToSubtract = day === 0 ? 6 : day - 1;
  const adjustedDate = new Date(date);
  adjustedDate.setDate(adjustedDate.getDate() - daysToSubtract);
  return adjustedDate;
}

/**
 * Parse time range string (e.g., "2w", "6m", "1y") and return start date
 * Supports: {n}w (weeks), {n}m (months), {n}y (years)
 * The returned start date is always adjusted to a Monday for chart alignment
 */
export function parseTimeRange(range?: string): Date | null {
  if (!range) return null;

  const match = range.match(/^(\d+)(w|m|y)$/);
  if (!match) return null;

  const [, amount, unit] = match;
  const now = new Date();
  const startDate = new Date();

  if (unit === 'w') {
    startDate.setDate(now.getDate() - parseInt(amount, 10) * 7);
  } else if (unit === 'm') {
    startDate.setMonth(now.getMonth() - parseInt(amount, 10));
  } else if (unit === 'y') {
    startDate.setFullYear(now.getFullYear() - parseInt(amount, 10));
  }

  // Adjust to Monday for proper chart alignment
  return adjustToMonday(startDate);
}

/**
 * Filter contributions by date range
 */
function filterContributions(
  contributions: Contribution[],
  startDate: Date | null
): Contribution[] {
  const today = new Date();
  today.setHours(23, 59, 59, 999); // End of today

  return contributions.filter((c) => {
    const contribDate = new Date(c.date);
    // Always filter out future dates
    if (contribDate > today) return false;
    // If startDate is set, filter out dates before it
    if (startDate && contribDate < startDate) return false;
    return true;
  });
}

/**
 * Fetch all contribution data for a user
 */
export async function fetchContributions(
  username: string,
  range?: string
): Promise<ContributionsData> {
  const years = await fetchYears(username);
  const startDate = parseTimeRange(range);

  // Determine which years to fetch based on range
  let yearsToFetch = years;
  if (startDate) {
    const startYear = startDate.getFullYear();
    yearsToFetch = years.filter((y) => parseInt(y.text, 10) >= startYear);
  }

  // Fetch all relevant years in parallel
  const yearDataPromises = yearsToFetch.map((year) =>
    fetchDataForYear(year.href)
  );
  const yearData = await Promise.all(yearDataPromises);

  // Combine all contributions
  let allContributions: Contribution[] = [];
  for (const data of yearData) {
    allContributions = [...allContributions, ...data.contributions];
  }

  // Sort by date ascending
  allContributions.sort((a, b) => a.date.localeCompare(b.date));

  // Filter by date range
  const filteredContributions = filterContributions(allContributions, startDate);

  // Calculate total
  const total = filteredContributions.reduce((sum, c) => sum + c.count, 0);

  // Get date range
  const range_start =
    filteredContributions.length > 0
      ? filteredContributions[0].date
      : new Date().toISOString().split('T')[0];
  const range_end =
    filteredContributions.length > 0
      ? filteredContributions[filteredContributions.length - 1].date
      : new Date().toISOString().split('T')[0];

  return {
    total,
    range: {
      start: range_start,
      end: range_end,
    },
    contributions: filteredContributions,
  };
}
