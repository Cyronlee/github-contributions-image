import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseTimeRange, fetchContributions } from '@/lib/github';

describe('parseTimeRange', () => {
  it('should return null for undefined input', () => {
    expect(parseTimeRange()).toBeNull();
  });

  it('should return null for invalid format', () => {
    expect(parseTimeRange('invalid')).toBeNull();
    expect(parseTimeRange('6')).toBeNull();
    expect(parseTimeRange('m6')).toBeNull();
    expect(parseTimeRange('6d')).toBeNull();
  });

  it('should parse months correctly', () => {
    const now = new Date();
    const result = parseTimeRange('6m');
    expect(result).toBeInstanceOf(Date);

    const expectedMonth = now.getMonth() - 6;
    const expected = new Date();
    expected.setMonth(expectedMonth);

    // Allow for some time difference during test execution
    expect(result!.getMonth()).toBe(expected.getMonth());
  });

  it('should parse years correctly', () => {
    const now = new Date();
    const result = parseTimeRange('1y');
    expect(result).toBeInstanceOf(Date);

    const expected = new Date();
    expected.setFullYear(now.getFullYear() - 1);

    expect(result!.getFullYear()).toBe(expected.getFullYear());
  });

  it('should parse multiple years', () => {
    const now = new Date();
    const result = parseTimeRange('2y');
    expect(result).toBeInstanceOf(Date);

    const expected = new Date();
    expected.setFullYear(now.getFullYear() - 2);

    expect(result!.getFullYear()).toBe(expected.getFullYear());
  });
});

describe('fetchContributions', () => {
  const originalFetch = global.fetch;

  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    global.fetch = originalFetch;
  });

  it('should throw error for failed fetch', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 404,
    });

    await expect(fetchContributions('nonexistent')).rejects.toThrow();
  });

  it('should fetch and parse contribution data', async () => {
    const mockYearsResponse = `
      <div>
        <a href="/testuser?from=2026-01-01" class="js-year-link filter-item">2026</a>
      </div>
    `;

    const mockContribResponse = `
      <div class="js-yearly-contributions">
        <h2>100 contributions in the last year</h2>
        <table class="ContributionCalendar-grid">
          <tbody>
            <tr>
              <td class="ContributionCalendar-day" data-date="2026-01-01" data-level="0"></td>
              <td class="ContributionCalendar-day" data-date="2026-01-02" data-level="1"></td>
              <td class="ContributionCalendar-day" data-date="2026-01-03" data-level="2"></td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    global.fetch = vi
      .fn()
      .mockResolvedValueOnce({
        ok: true,
        text: async () => mockYearsResponse,
      })
      .mockResolvedValueOnce({
        ok: true,
        text: async () => mockContribResponse,
      });

    const result = await fetchContributions('testuser');

    expect(result).toHaveProperty('total');
    expect(result).toHaveProperty('range');
    expect(result).toHaveProperty('contributions');
    expect(Array.isArray(result.contributions)).toBe(true);
  });

  it('should filter contributions by range', async () => {
    const mockYearsResponse = `
      <div>
        <a href="/testuser?from=2026-01-01" class="js-year-link filter-item">2026</a>
        <a href="/testuser?from=2025-01-01" class="js-year-link filter-item">2025</a>
      </div>
    `;

    // Create contributions spanning 2 months
    const contributions = [];
    const startDate = new Date('2025-12-01');
    const endDate = new Date('2026-01-20');
    const currentDate = new Date(startDate);

    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      contributions.push(
        `<td class="ContributionCalendar-day" data-date="${dateStr}" data-level="1"></td>`
      );
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const mockContribResponse = `
      <div class="js-yearly-contributions">
        <h2>50 contributions</h2>
        <table class="ContributionCalendar-grid">
          <tbody>
            <tr>${contributions.join('')}</tr>
          </tbody>
        </table>
      </div>
    `;

    global.fetch = vi.fn().mockImplementation((url: string) => {
      return Promise.resolve({
        ok: true,
        text: async () =>
          url.includes('tab=contributions') && !url.includes('from=')
            ? mockYearsResponse
            : mockContribResponse,
      });
    });

    const result = await fetchContributions('testuser', '1m');

    expect(result.contributions.length).toBeGreaterThan(0);
    // All contributions should be within the last month
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    for (const contrib of result.contributions) {
      const contribDate = new Date(contrib.date);
      expect(contribDate >= oneMonthAgo).toBe(true);
    }
  });
});
