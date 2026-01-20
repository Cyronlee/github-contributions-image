# GitHub Contributions Image Generator - 技术方案文档

## 1. 项目概述

本项目是一个 GitHub 贡献图图像生成器，提供 Data API 和 Image API 两个接口，用于获取用户的 GitHub 贡献数据并生成可视化图片。

### 1.1 技术栈选型

| 技术 | 版本 | 用途 |
|------|------|------|
| Next.js | 16.x | Web 框架，支持 API Routes 和 Edge Runtime |
| TypeScript | 5.x | 类型安全 |
| Cheerio | 1.x | HTML 解析，用于抓取 GitHub 贡献数据 |
| @vercel/og | 0.6.x | 基于 Satori 的图像生成，适配 Vercel Edge Runtime |
| Vitest | 2.x | 单元测试框架 |

### 1.2 架构概览

```
┌─────────────────────────────────────────────────────────────┐
│                        Next.js App                          │
├─────────────────────────────────────────────────────────────┤
│  /api/v1/data          │  /api/v1/image                     │
│  (Node.js Runtime)     │  (Edge Runtime)                    │
├────────────────────────┼────────────────────────────────────┤
│           lib/github.ts - 数据抓取层                         │
├─────────────────────────────────────────────────────────────┤
│           lib/render.tsx - 图像渲染层                        │
├─────────────────────────────────────────────────────────────┤
│           lib/themes.ts - 主题配置                           │
└─────────────────────────────────────────────────────────────┘
```

## 2. API 设计

### 2.1 Data API

**端点**: `GET /api/v1/data`

**参数**:
- `username` (必填): GitHub 用户名
- `range` (可选): 时间范围
  - `nm`: 最近 n 个月（如 `6m`）
  - `ny`: 最近 n 年（如 `1y`）
  - 不传则返回全部数据

**响应格式**:
```json
{
  "total": 492,
  "range": {
    "start": "2025-01-20",
    "end": "2026-01-20"
  },
  "contributions": [
    {
      "date": "2025-01-20",
      "count": 5,
      "level": 2
    }
  ]
}
```

**缓存策略**:
- `Cache-Control: public, s-maxage=3600, stale-while-revalidate=86400`
- CDN 缓存 1 小时，过期后可使用陈旧数据 24 小时

### 2.2 Image API

**端点**: `GET /api/v1/image`

**参数**:
- `username` (必填): GitHub 用户名
- `range` (可选): 时间范围（同 Data API）
- `theme` (可选): 主题
  - `light`: 亮色主题（默认）
  - `dark`: 暗色主题

**响应**:
- Content-Type: `image/png`
- 分辨率: 2x 缩放，确保高清显示

**缓存策略**: 同 Data API

## 3. 核心模块设计

### 3.1 数据抓取模块 (`lib/github.ts`)

```typescript
// 主要导出函数
export async function fetchContributions(
  username: string,
  range?: string
): Promise<ContributionsData>

export function parseTimeRange(range?: string): Date | null
```

**实现原理**:
1. 请求 GitHub 用户贡献页面 (`/{username}?tab=contributions`)
2. 使用 Cheerio 解析 HTML，提取年份链接
3. 并行请求各年份数据
4. 从 `ContributionCalendar-day` 元素提取日期和 level
5. 根据 range 参数过滤数据，排除未来日期

**数据提取**:
```html
<td class="ContributionCalendar-day" 
    data-date="2026-01-20" 
    data-level="2">
</td>
```

### 3.2 图像渲染模块 (`lib/render.tsx`)

**渲染参数**:
```typescript
// 基础尺寸
const BASE_BOX_SIZE = 11;      // 格子大小
const BASE_BOX_GAP = 3;        // 格子间距
const BASE_PADDING = 20;       // 画布边距
const BASE_FONT_SIZE = 12;     // 字体大小

// 缩放因子 - 所有尺寸都会乘以此值
const SCALE = 2;

// 实际渲染尺寸 = 基础尺寸 × SCALE
const BOX_SIZE = BASE_BOX_SIZE * SCALE;   // 22
const BOX_GAP = BASE_BOX_GAP * SCALE;     // 6
const PADDING = BASE_PADDING * SCALE;     // 40
const FONT_SIZE = BASE_FONT_SIZE * SCALE; // 24
```

**布局结构**:
```
┌─────────────────────────────────────────┐
│  [padding]                              │
│  ┌─────────────────────────────────┐   │
│  │ Jan  Feb  Mar  Apr  May  ...    │   │ ← 月份标签
│  ├─────────────────────────────────┤   │
│  │     [□][□][□][□][□]...          │   │ ← Sun
│  │ Mon [■][□][■][□][■]...          │   │ ← Mon
│  │     [□][□][□][□][□]...          │   │ ← Tue
│  │ Wed [□][■][□][■][□]...          │   │ ← Wed
│  │     [□][□][□][□][□]...          │   │ ← Thu
│  │ Fri [□][□][□][□][□]...          │   │ ← Fri
│  │     [□][□][□][□][□]...          │   │ ← Sat
│  └─────────────────────────────────┘   │
│                    Less □□□□□ More     │ ← 图例
└─────────────────────────────────────────┘
```

**月份对齐算法**:
- 月份标签基于每周的**周日**日期判断
- 当周日进入新月份时，在该列上方显示月份标签
- 避免月份标签在周中变化导致的错位

**数据组织**:
```typescript
function organizeContributions(contributions: Contribution[]): {
  weeks: (Contribution | null)[][];  // 按周分组的贡献数据
  months: { name: string; weekIndex: number }[];  // 月份标签位置
}
```

### 3.3 主题配置 (`lib/themes.ts`)

**亮色主题**:
```typescript
{
  background: '#ffffff',
  text: '#1f2328',      // 深色文字，提高可读性
  grade0: '#ebedf0',    // 无贡献
  grade1: '#9be9a8',    // 低贡献
  grade2: '#40c463',    // 中低贡献
  grade3: '#30a14e',    // 中高贡献
  grade4: '#216e39',    // 高贡献
}
```

**暗色主题**:
```typescript
{
  background: '#0d1117',
  text: '#e6edf3',
  grade0: '#161b22',
  grade1: '#0e4429',
  grade2: '#006d32',
  grade3: '#26a641',
  grade4: '#39d353',
}
```

## 4. 测试策略

### 4.1 测试文件结构

```
__tests__/
├── fixtures/
│   └── contributions.ts    # 测试数据生成器
├── github.test.ts          # 数据抓取测试
├── render.test.tsx         # 图像渲染测试
└── themes.test.ts          # 主题配置测试
```

### 4.2 测试覆盖

| 模块 | 测试内容 |
|------|---------|
| `github.ts` | `parseTimeRange` 解析、`fetchContributions` 数据抓取、范围过滤 |
| `render.tsx` | 图像生成、空数据处理、大数据量处理、尺寸计算 |
| `themes.ts` | 主题完整性、颜色格式验证、默认主题回退 |

### 4.3 运行测试

```bash
bun run test        # 运行所有测试
bun run test:watch  # 监听模式
```

## 5. 部署配置

### 5.1 Vercel 部署

项目专为 Vercel 优化：
- Image API 使用 Edge Runtime，全球低延迟
- `@vercel/og` 原生支持，无需额外配置
- 自动 CDN 缓存

### 5.2 环境要求

- Node.js 18+
- 支持 Edge Runtime 的平台

## 6. 性能优化

### 6.1 缓存策略

- **CDN 缓存**: 1 小时有效期
- **Stale-While-Revalidate**: 24 小时内可返回陈旧数据同时后台更新
- **并行请求**: 多年份数据并行抓取

### 6.2 图像优化

- **2x 分辨率**: 所有渲染尺寸（格子、间距、字体等）均乘以缩放因子，确保 Retina 显示清晰
- **PNG 格式**: 适合图表类图像，保持锐利边缘
- **按需渲染**: 不预生成，请求时实时渲染
- **尺寸计算**: 画布尺寸根据贡献数据动态计算，避免空白区域

## 7. 使用示例

### 7.1 获取数据

```bash
# 获取最近 6 个月数据
curl "https://your-domain.com/api/v1/data?username=cyronlee&range=6m"

# 获取全部数据
curl "https://your-domain.com/api/v1/data?username=cyronlee"
```

### 7.2 获取图像

```bash
# 亮色主题，最近 1 年
curl -o contributions.png "https://your-domain.com/api/v1/image?username=cyronlee&range=1y"

# 暗色主题
curl -o contributions-dark.png "https://your-domain.com/api/v1/image?username=cyronlee&theme=dark"
```

### 7.3 嵌入 Markdown

```markdown
![GitHub Contributions](https://your-domain.com/api/v1/image?username=cyronlee&range=1y)
```

## 8. 项目结构

```
github-contributions-image/
├── app/
│   └── api/v1/
│       ├── data/route.ts      # Data API
│       └── image/route.tsx    # Image API
├── lib/
│   ├── github.ts              # 数据抓取
│   ├── render.tsx             # 图像渲染
│   ├── themes.ts              # 主题配置
│   └── types.ts               # 类型定义
├── __tests__/                 # 测试文件
├── docs/
│   └── technical-design.md    # 技术方案文档
├── package.json
├── vitest.config.ts
└── tsconfig.json
```

## 9. 后续优化方向

1. **自定义颜色**: 支持用户自定义贡献格子颜色
2. **更多时间范围**: 支持自定义日期范围查询
3. **SVG 输出**: 提供 SVG 格式选项
4. **用户信息**: 可选显示用户头像和名称
5. **统计信息**: 显示总贡献数、最长连续天数等
