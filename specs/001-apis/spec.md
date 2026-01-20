这个项目为github contributions image generator，用于提供data api和image api

项目框架为nextjs 16，需要部署在vercel上

## data api

GET /api/v1/data?username=cyronlee&range=6m

### params

- `username`: string
- `range`: string
  - `1m` - Last 1 month
  - `nm` - Last n months
  - `1y` - Last 1 year
  - `ny` - Last n years
  - Default: All time

### response structure

```json
{
  "total": 492,
  "range": {
    "start": "2025-12-30",
    "end": "2026-01-02"
  },
  "contributions": [
    {
      "date": "2025-12-30",
      "count": 0,
      "level": 0
    },
    {
      "date": "2025-12-31",
      "count": 0,
      "level": 0
    },
    {
      "date": "2026-01-01",
      "count": 9,
      "level": 4
    },
    {
      "date": "2020-01-02",
      "count": 5,
      "level": 2
    }
  ]
}
```

## image api

GET /api/v1/image?username=cyronlee&range=6m&theme=light

### params
- `username`: string
- `range`: string
  - `1m` - Last 1 month
  - `nm` - Last n months
  - `1y` - Last 1 year
  - `ny` - Last n years
  - Default: All time
- `theme`: string
  - `light` - Light theme
  - `dark` - Dark theme
  - Default: Light

### ui

参考给你的图片

- 主要渲染 contributions 格子
- 格子上面为月份，对齐格子
- 格子左侧为Mon、Web、Fri标识，对齐格子
- 格子下面右侧是 level indicator

### 注意

- 输出图片格式为png
- 需要给图片加缓存