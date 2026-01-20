'use client';

import { useState } from 'react';
import Image from 'next/image';

export default function Home() {
  const [username, setUsername] = useState('cyronlee');
  const [range, setRange] = useState('1y');
  const [theme, setTheme] = useState('light');
  const [copied, setCopied] = useState('');

  const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const imageUrl = `${baseUrl}/api/v1/image?username=${username}&range=${range}&theme=${theme}`;
  const dataUrl = `${baseUrl}/api/v1/data?username=${username}&range=${range}`;

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text);
    setCopied(type);
    setTimeout(() => setCopied(''), 2000);
  };

  const rangeOptions = [
    { value: '', label: 'All time' },
    { value: '2w', label: '2 weeks' },
    { value: '4w', label: '4 weeks' },
    { value: '1m', label: '1 month' },
    { value: '3m', label: '3 months' },
    { value: '6m', label: '6 months' },
    { value: '1y', label: '1 year' },
    { value: '2y', label: '2 years' },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-zinc-50 to-white dark:from-zinc-950 dark:to-black">
      <main className="mx-auto max-w-5xl px-6 py-16">
        {/* Header */}
        <div className="mb-12 text-center">
          <h1 className="mb-4 text-5xl font-bold text-zinc-900 dark:text-zinc-50">
            GitHub Contributions Image
          </h1>
          <p className="text-lg text-zinc-600 dark:text-zinc-400">
            Generate beautiful contribution charts from any GitHub profile
          </p>
        </div>

        {/* Interactive Generator */}
        <div className="mb-16 rounded-2xl border border-zinc-200 bg-white p-8 shadow-lg dark:border-zinc-800 dark:bg-zinc-900">
          <h2 className="mb-6 text-2xl font-semibold text-zinc-900 dark:text-zinc-50">
            Generate Your Chart
          </h2>

          <div className="mb-6 grid gap-4 md:grid-cols-3">
            {/* Username Input */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                GitHub Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              />
            </div>

            {/* Range Select */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Time Range
              </label>
              <select
                value={range}
                onChange={(e) => setRange(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              >
                {rangeOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Theme Select */}
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                Theme
              </label>
              <select
                value={theme}
                onChange={(e) => setTheme(e.target.value)}
                className="w-full rounded-lg border border-zinc-300 px-4 py-2 text-zinc-900 focus:border-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-200 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100 dark:focus:border-zinc-500 dark:focus:ring-zinc-700"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>

          {/* Preview */}
          <div className="mb-6">
            <h3 className="mb-3 text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Preview
            </h3>
            <div className="overflow-hidden rounded-lg border border-zinc-200 bg-zinc-50 p-4 dark:border-zinc-700 dark:bg-zinc-800">
              <Image
                src={imageUrl}
                alt="GitHub Contributions"
                width={1000}
                height={200}
                className="w-full"
                unoptimized
              />
            </div>
          </div>

          {/* Copy URLs */}
          <div className="space-y-4">
            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Markdown
                </label>
                <button
                  onClick={() =>
                    copyToClipboard(`![GitHub Contributions](${imageUrl})`, 'markdown')
                  }
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {copied === 'markdown' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <code className="block w-full overflow-x-auto rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                ![GitHub Contributions]({imageUrl})
              </code>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  HTML
                </label>
                <button
                  onClick={() =>
                    copyToClipboard(
                      `<img src="${imageUrl}" alt="GitHub Contributions" />`,
                      'html'
                    )
                  }
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {copied === 'html' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <code className="block w-full overflow-x-auto rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                &lt;img src=&quot;{imageUrl}&quot; alt=&quot;GitHub Contributions&quot; /&gt;
              </code>
            </div>

            <div>
              <div className="mb-2 flex items-center justify-between">
                <label className="text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Direct URL
                </label>
                <button
                  onClick={() => copyToClipboard(imageUrl, 'url')}
                  className="text-sm text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
                >
                  {copied === 'url' ? '✓ Copied!' : 'Copy'}
                </button>
              </div>
              <code className="block w-full overflow-x-auto rounded-lg bg-zinc-100 px-4 py-2 text-sm text-zinc-900 dark:bg-zinc-800 dark:text-zinc-100">
                {imageUrl}
              </code>
            </div>
          </div>
        </div>

        {/* API Documentation */}
        <div className="space-y-8">
          <h2 className="text-3xl font-bold text-zinc-900 dark:text-zinc-50">
            API Documentation
          </h2>

          {/* Image API */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Image API
            </h3>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              Generate a PNG image of GitHub contribution chart.
            </p>

            <div className="mb-4">
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Endpoint</h4>
              <code className="block rounded-lg bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
                GET /api/v1/image
              </code>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Parameters</h4>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="pb-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">
                      Name
                    </th>
                    <th className="pb-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">
                      Type
                    </th>
                    <th className="pb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600 dark:text-zinc-400">
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4">
                      <code className="text-zinc-900 dark:text-zinc-100">username</code>
                    </td>
                    <td className="py-2 pr-4">string (required)</td>
                    <td className="py-2">GitHub username</td>
                  </tr>
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4">
                      <code className="text-zinc-900 dark:text-zinc-100">range</code>
                    </td>
                    <td className="py-2 pr-4">string (optional)</td>
                    <td className="py-2">
                      Time range: <code>{'{n}w'}</code> (weeks), <code>{'{n}m'}</code> (months),{' '}
                      <code>{'{n}y'}</code> (years). e.g., <code>2w</code>, <code>6m</code>,{' '}
                      <code>1y</code>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <code className="text-zinc-900 dark:text-zinc-100">theme</code>
                    </td>
                    <td className="py-2 pr-4">string (optional)</td>
                    <td className="py-2">
                      Theme: <code>light</code> (default), <code>dark</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Example</h4>
              <code className="block overflow-x-auto rounded-lg bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
                {baseUrl}/api/v1/image?username=cyronlee&range=1y&theme=light
              </code>
            </div>
          </div>

          {/* Data API */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Data API
            </h3>
            <p className="mb-4 text-zinc-600 dark:text-zinc-400">
              Get raw contribution data in JSON format.
            </p>

            <div className="mb-4">
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Endpoint</h4>
              <code className="block rounded-lg bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
                GET /api/v1/data
              </code>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Parameters</h4>
              <table className="w-full text-left text-sm">
                <thead className="border-b border-zinc-200 dark:border-zinc-700">
                  <tr>
                    <th className="pb-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">
                      Name
                    </th>
                    <th className="pb-2 pr-4 font-medium text-zinc-900 dark:text-zinc-50">
                      Type
                    </th>
                    <th className="pb-2 font-medium text-zinc-900 dark:text-zinc-50">
                      Description
                    </th>
                  </tr>
                </thead>
                <tbody className="text-zinc-600 dark:text-zinc-400">
                  <tr className="border-b border-zinc-100 dark:border-zinc-800">
                    <td className="py-2 pr-4">
                      <code className="text-zinc-900 dark:text-zinc-100">username</code>
                    </td>
                    <td className="py-2 pr-4">string (required)</td>
                    <td className="py-2">GitHub username</td>
                  </tr>
                  <tr>
                    <td className="py-2 pr-4">
                      <code className="text-zinc-900 dark:text-zinc-100">range</code>
                    </td>
                    <td className="py-2 pr-4">string (optional)</td>
                    <td className="py-2">
                      Time range: <code>{'{n}w'}</code> (weeks), <code>{'{n}m'}</code> (months),{' '}
                      <code>{'{n}y'}</code> (years). e.g., <code>2w</code>, <code>6m</code>,{' '}
                      <code>1y</code>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mb-4">
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Example</h4>
              <code className="block overflow-x-auto rounded-lg bg-zinc-100 px-4 py-2 text-sm dark:bg-zinc-800">
                {baseUrl}/api/v1/data?username=cyronlee&range=6m
              </code>
            </div>

            <div>
              <h4 className="mb-2 font-medium text-zinc-900 dark:text-zinc-50">Response</h4>
              <pre className="overflow-x-auto rounded-lg bg-zinc-100 p-4 text-sm dark:bg-zinc-800">
                <code className="text-zinc-900 dark:text-zinc-100">
                  {`{
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
}`}
                </code>
              </pre>
            </div>
          </div>

          {/* Features */}
          <div className="rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
            <h3 className="mb-4 text-xl font-semibold text-zinc-900 dark:text-zinc-50">
              Features
            </h3>
            <ul className="space-y-2 text-zinc-600 dark:text-zinc-400">
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-50">Fast & Reliable:</strong>{' '}
                  Powered by Vercel Edge Runtime with global CDN
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-50">High Quality:</strong> 2x
                  resolution for crisp Retina displays
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-50">Smart Caching:</strong> 1
                  hour CDN cache with 24 hour stale-while-revalidate
                </span>
              </li>
              <li className="flex items-start">
                <span className="mr-2">•</span>
                <span>
                  <strong className="text-zinc-900 dark:text-zinc-50">Flexible:</strong> Customizable
                  time ranges and themes
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 border-t border-zinc-200 pt-8 text-center text-sm text-zinc-500 dark:border-zinc-800 dark:text-zinc-500">
          <p>
            Built with Next.js • Data from GitHub • Open Source on{' '}
            <a
              href="https://github.com/cyronlee/github-contributions-image"
              className="underline hover:text-zinc-900 dark:hover:text-zinc-300"
            >
              GitHub
            </a>
          </p>
        </div>
      </main>
    </div>
  );
}
