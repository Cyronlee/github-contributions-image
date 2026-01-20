# GitHub Contributions Image

Generate beautiful GitHub contribution charts as PNG images for embedding in your README, blog, or website.

![GitHub Contributions](https://github-contributions-image.vercel.app/api/v1/image?username=cyronlee&range=1y&theme=light)

## Features

- **🚀 Fast & Reliable**: Powered by Vercel Edge Runtime with global CDN
- **🎨 Theme Support**: Light and dark themes available
- **📊 Flexible Time Ranges**: Support weeks, months, and years with custom values
- **🖼️ High Quality**: 2x resolution for crisp Retina displays
- **⚡ Smart Caching**: 1 hour CDN cache with 24 hour stale-while-revalidate

## Usage

### Embed in Markdown

```markdown
![GitHub Contributions](https://github-contributions-image.vercel.app/api/v1/image?username=YOUR_USERNAME)
```

### Embed in HTML

```html
<img src="https://github-contributions-image.vercel.app/api/v1/image?username=YOUR_USERNAME" alt="GitHub Contributions" />
```

## API Reference

### Image API

**Endpoint**: `GET /api/v1/image`

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string (required) | GitHub username |
| `range` | string (optional) | Time range: `{n}w` (weeks), `{n}m` (months), `{n}y` (years). e.g., `2w`, `6m`, `1y` |
| `theme` | string (optional) | Theme: `light` (default), `dark` |

**Examples**:
```
/api/v1/image?username=cyronlee&range=1y&theme=light
/api/v1/image?username=cyronlee&range=6m&theme=dark
/api/v1/image?username=cyronlee&range=4w
```

### Data API

**Endpoint**: `GET /api/v1/data`

| Parameter | Type | Description |
|-----------|------|-------------|
| `username` | string (required) | GitHub username |
| `range` | string (optional) | Time range: `{n}w` (weeks), `{n}m` (months), `{n}y` (years). e.g., `2w`, `6m`, `1y` |

**Response**:
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

## Development

### Getting Started

```bash
# Install dependencies
bun install

# Run development server
bun dev

# Run tests
bun test

# Run tests in watch mode
bun test:watch
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

### Tech Stack

- [Next.js](https://nextjs.org) 16.x - Web framework with API Routes and Edge Runtime
- [TypeScript](https://www.typescriptlang.org) 5.x - Type safety
- [Cheerio](https://cheerio.js.org) - HTML parsing for GitHub data scraping
- [@vercel/og](https://vercel.com/docs/functions/og-image-generation) - Image generation using Satori
- [Vitest](https://vitest.dev) - Unit testing

## Deploy on Vercel

The easiest way to deploy is using the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js).

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fcyronlee%2Fgithub-contributions-image)

## License

MIT
