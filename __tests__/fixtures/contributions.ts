import type { Contribution, ContributionsData } from '@/lib/types';

/**
 * Generate mock contribution data for testing
 */
export function generateMockContributions(
  startDate: string,
  endDate: string,
  options?: {
    fillAll?: boolean;
    maxLevel?: number;
  }
): ContributionsData {
  const { fillAll = true, maxLevel = 4 } = options ?? {};

  const contributions: Contribution[] = [];
  const start = new Date(startDate);
  const end = new Date(endDate);
  let total = 0;

  const currentDate = new Date(start);
  while (currentDate <= end) {
    const dateStr = currentDate.toISOString().split('T')[0];

    // Generate random level and count
    const level = fillAll
      ? Math.floor(Math.random() * (maxLevel + 1))
      : Math.random() > 0.3
        ? Math.floor(Math.random() * (maxLevel + 1))
        : 0;

    const levelCounts = [0, 1, 3, 6, 10];
    const count = level > 0 ? levelCounts[level] + Math.floor(Math.random() * 3) : 0;

    contributions.push({
      date: dateStr,
      count,
      level,
    });

    total += count;
    currentDate.setDate(currentDate.getDate() + 1);
  }

  return {
    total,
    range: {
      start: startDate,
      end: endDate,
    },
    contributions,
  };
}

/**
 * Static mock data for consistent test results
 */
export const mockContributionsData: ContributionsData = {
  total: 492,
  range: {
    start: '2025-07-01',
    end: '2026-01-20',
  },
  contributions: [
    { date: '2025-07-01', count: 0, level: 0 },
    { date: '2025-07-02', count: 2, level: 1 },
    { date: '2025-07-03', count: 5, level: 2 },
    { date: '2025-07-04', count: 8, level: 3 },
    { date: '2025-07-05', count: 12, level: 4 },
    { date: '2025-07-06', count: 0, level: 0 },
    { date: '2025-07-07', count: 3, level: 1 },
    { date: '2025-07-08', count: 0, level: 0 },
    { date: '2025-07-09', count: 4, level: 2 },
    { date: '2025-07-10', count: 7, level: 3 },
    { date: '2025-07-11', count: 0, level: 0 },
    { date: '2025-07-12', count: 1, level: 1 },
    { date: '2025-07-13', count: 6, level: 2 },
    { date: '2025-07-14', count: 9, level: 4 },
  ],
};

/**
 * Mock GitHub HTML response for year links
 */
export const mockYearsHtml = `
<div class="js-yearly-contributions">
  <div class="js-year-link filter-item">
    <a href="/cyronlee?from=2026-01-01&to=2026-12-31&tab=contributions" class="js-year-link filter-item">2026</a>
  </div>
  <div class="js-year-link filter-item">
    <a href="/cyronlee?from=2025-01-01&to=2025-12-31&tab=contributions" class="js-year-link filter-item">2025</a>
  </div>
</div>
`;

/**
 * Mock GitHub HTML response for contribution calendar
 */
export const mockCalendarHtml = `
<div class="js-yearly-contributions">
  <h2>492 contributions in the last year</h2>
  <table class="ContributionCalendar-grid">
    <tbody>
      <tr>
        <td class="ContributionCalendar-day" data-date="2025-07-01" data-level="0"></td>
        <td class="ContributionCalendar-day" data-date="2025-07-02" data-level="1"></td>
        <td class="ContributionCalendar-day" data-date="2025-07-03" data-level="2"></td>
        <td class="ContributionCalendar-day" data-date="2025-07-04" data-level="3"></td>
        <td class="ContributionCalendar-day" data-date="2025-07-05" data-level="4"></td>
      </tr>
    </tbody>
  </table>
</div>
`;
