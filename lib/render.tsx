import type { Contribution, ContributionsData, Theme, ThemeName } from './types';
import { getTheme } from './themes';
import { ImageResponse } from '@vercel/og';

// Base dimensions
const BASE_BOX_SIZE = 11;
const BASE_BOX_GAP = 3;
const BASE_PADDING = 20;
const BASE_MONTH_LABEL_HEIGHT = 20;
const BASE_DAY_LABEL_WIDTH = 36;
const BASE_LEGEND_HEIGHT = 30;
const BASE_FONT_SIZE = 12;

// Scale factor for higher resolution
const SCALE = 2;

// Scaled dimensions
const BOX_SIZE = BASE_BOX_SIZE * SCALE;
const BOX_GAP = BASE_BOX_GAP * SCALE;
const BOX_TOTAL = BOX_SIZE + BOX_GAP;
const PADDING = BASE_PADDING * SCALE;
const MONTH_LABEL_HEIGHT = BASE_MONTH_LABEL_HEIGHT * SCALE;
const DAY_LABEL_WIDTH = BASE_DAY_LABEL_WIDTH * SCALE;
const LEGEND_HEIGHT = BASE_LEGEND_HEIGHT * SCALE;
const FONT_SIZE = BASE_FONT_SIZE * SCALE;

interface RenderOptions {
  data: ContributionsData;
  theme?: ThemeName;
}

/**
 * Get the color for a contribution level
 */
function getLevelColor(level: number, theme: Theme): string {
  const colors: Record<number, string> = {
    0: theme.grade0,
    1: theme.grade1,
    2: theme.grade2,
    3: theme.grade3,
    4: theme.grade4,
  };
  return colors[level] ?? theme.grade0;
}

/**
 * Organize contributions into a weekly grid structure
 */
function organizeContributions(contributions: Contribution[]): {
  weeks: (Contribution | null)[][];
  months: { name: string; weekIndex: number }[];
} {
  if (contributions.length === 0) {
    return { weeks: [], months: [] };
  }

  const weeks: (Contribution | null)[][] = [];
  const months: { name: string; weekIndex: number }[] = [];

  // Create a map for quick lookup
  const contribMap = new Map<string, Contribution>();
  for (const c of contributions) {
    contribMap.set(c.date, c);
  }

  // Get start and end dates
  const startDate = new Date(contributions[0].date);
  const endDate = new Date(contributions[contributions.length - 1].date);

  // Adjust start date to the beginning of its week (Sunday)
  const adjustedStart = new Date(startDate);
  adjustedStart.setDate(adjustedStart.getDate() - adjustedStart.getDay());

  // Iterate through weeks
  let currentDate = new Date(adjustedStart);
  let lastMonth = -1;

  while (currentDate <= endDate) {
    const week: (Contribution | null)[] = [];
    const weekStartDate = new Date(currentDate); // Sunday of this week

    for (let day = 0; day < 7; day++) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const contrib = contribMap.get(dateStr);

      if (currentDate >= startDate && currentDate <= endDate && contrib) {
        week.push(contrib);
      } else {
        week.push(null);
      }

      currentDate.setDate(currentDate.getDate() + 1);
    }

    weeks.push(week);

    // Track month changes based on the SUNDAY (first day) of each week
    const sundayMonth = weekStartDate.getMonth();
    if (sundayMonth !== lastMonth && weekStartDate >= startDate) {
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      months.push({
        name: monthNames[sundayMonth],
        weekIndex: weeks.length - 1,
      });
      lastMonth = sundayMonth;
    } else if (lastMonth === -1) {
      // Handle first week: use the first visible date's month
      const firstVisibleDate = new Date(startDate);
      const firstMonth = firstVisibleDate.getMonth();
      const monthNames = [
        'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
        'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
      ];
      months.push({
        name: monthNames[firstMonth],
        weekIndex: weeks.length - 1,
      });
      lastMonth = firstMonth;
    }
  }

  return { weeks, months };
}

/**
 * Generate the contribution graph component
 */
function ContributionGraph({ data, theme }: { data: ContributionsData; theme: Theme }) {
  const { weeks, months } = organizeContributions(data.contributions);

  const graphWidth = weeks.length * BOX_TOTAL - BOX_GAP;
  const graphHeight = 7 * BOX_TOTAL - BOX_GAP;
  const totalWidth = DAY_LABEL_WIDTH + graphWidth + PADDING * 2;
  const totalHeight = MONTH_LABEL_HEIGHT + graphHeight + LEGEND_HEIGHT + PADDING * 2;

  // Day labels with proper alignment
  const dayLabels = [
    { label: 'Mon', row: 1 },
    { label: 'Wed', row: 3 },
    { label: 'Fri', row: 5 },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        backgroundColor: theme.background,
        padding: PADDING,
        width: totalWidth,
        height: totalHeight,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
      }}
    >
      {/* Month labels */}
      <div
        style={{
          display: 'flex',
          marginLeft: DAY_LABEL_WIDTH,
          height: MONTH_LABEL_HEIGHT,
          position: 'relative',
        }}
      >
        {months.map((month, i) => (
          <span
            key={i}
            style={{
              position: 'absolute',
              left: month.weekIndex * BOX_TOTAL,
              color: theme.text,
              fontSize: FONT_SIZE,
              fontWeight: 400,
            }}
          >
            {month.name}
          </span>
        ))}
      </div>

      {/* Main grid area */}
      <div style={{ display: 'flex' }}>
        {/* Day labels */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: DAY_LABEL_WIDTH,
            height: graphHeight,
            position: 'relative',
          }}
        >
          {dayLabels.map(({ label, row }) => (
            <div
              key={label}
              style={{
                position: 'absolute',
                top: row * BOX_TOTAL,
                height: BOX_SIZE,
                display: 'flex',
                alignItems: 'center',
                color: theme.text,
                fontSize: FONT_SIZE,
                fontWeight: 400,
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* Contribution grid */}
        <div style={{ display: 'flex', gap: BOX_GAP }}>
          {weeks.map((week, weekIndex) => (
            <div
              key={weekIndex}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: BOX_GAP,
              }}
            >
              {week.map((day, dayIndex) => (
                <div
                  key={dayIndex}
                  style={{
                    width: BOX_SIZE,
                    height: BOX_SIZE,
                    backgroundColor: day
                      ? getLevelColor(day.level, theme)
                      : 'transparent',
                    borderRadius: 3 * SCALE,
                  }}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Legend */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          marginTop: 12 * SCALE,
          gap: 4 * SCALE,
        }}
      >
        <span style={{ color: theme.text, fontSize: FONT_SIZE, marginRight: 4 * SCALE }}>
          Less
        </span>
        {[0, 1, 2, 3, 4].map((level) => (
          <div
            key={level}
            style={{
              width: BOX_SIZE,
              height: BOX_SIZE,
              backgroundColor: getLevelColor(level, theme),
              borderRadius: 3 * SCALE,
            }}
          />
        ))}
        <span style={{ color: theme.text, fontSize: FONT_SIZE, marginLeft: 4 * SCALE }}>
          More
        </span>
      </div>
    </div>
  );
}

/**
 * Calculate image dimensions based on contributions data
 */
export function calculateImageDimensions(data: ContributionsData): {
  width: number;
  height: number;
} {
  const { weeks } = organizeContributions(data.contributions);
  const graphWidth = weeks.length * BOX_TOTAL - BOX_GAP;
  const graphHeight = 7 * BOX_TOTAL - BOX_GAP;
  const totalWidth = DAY_LABEL_WIDTH + graphWidth + PADDING * 2;
  const totalHeight = MONTH_LABEL_HEIGHT + graphHeight + LEGEND_HEIGHT + PADDING * 2;

  return { width: totalWidth, height: totalHeight };
}

/**
 * Render contributions data to PNG using ImageResponse
 */
export async function renderContributionsImage(
  options: RenderOptions
): Promise<ImageResponse> {
  const { data, theme: themeName = 'light' } = options;
  const theme = getTheme(themeName);

  const { width, height } = calculateImageDimensions(data);

  return new ImageResponse(<ContributionGraph data={data} theme={theme} />, {
    width,
    height,
  });
}

// Export for testing
export { organizeContributions, ContributionGraph };
