
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Utility for conditional class name joining with Tailwind
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Generates HTML for downloadable reports
 */
export function generateReportHTML(title: string, content: string): string {
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title}</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          line-height: 1.6;
          color: #333;
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        h1 {
          color: #1a365d;
          border-bottom: 2px solid #e2e8f0;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }
        h2 {
          color: #2a4365;
          margin-top: 30px;
          padding-bottom: 5px;
          border-bottom: 1px solid #e2e8f0;
        }
        .date {
          color: #718096;
          font-style: italic;
          margin-bottom: 20px;
        }
        .recommendation, .price-target {
          font-weight: bold;
          margin-bottom: 10px;
        }
        .summary {
          background-color: #f7fafc;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
        }
        .section {
          margin: 25px 0;
        }
      </style>
    </head>
    <body>
      ${content}
    </body>
    </html>
  `;
}
