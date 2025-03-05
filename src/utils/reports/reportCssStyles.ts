
/**
 * CSS styles for the HTML research report
 */
export const getReportStyles = (): string => {
  return `
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      max-width: 900px;
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
    h3 {
      color: #1e40af;
      margin-top: 20px;
    }
    h4 {
      color: #3b82f6;
    }
    .date {
      color: #718096;
      font-style: italic;
      margin-bottom: 20px;
    }
    .rating-section {
      display: flex;
      flex-wrap: wrap;
      gap: 20px;
      margin: 20px 0;
    }
    .rating-item {
      flex: 1;
      min-width: 200px;
      padding: 15px;
      border: 1px solid #e2e8f0;
      border-radius: 5px;
      background-color: #f8fafc;
    }
    .rating-item h3 {
      margin-top: 0;
      font-size: 16px;
      color: #64748b;
    }
    .recommendation {
      font-weight: bold;
      font-size: 20px;
      color: #047857;
    }
    .price-target {
      font-weight: bold;
      font-size: 20px;
      color: #0369a1;
    }
    .summary {
      background-color: #f8fafc;
      padding: 15px;
      border-radius: 5px;
      border-left: 4px solid #3b82f6;
      margin: 20px 0;
    }
    .section {
      margin: 30px 0;
    }
    .scenario {
      padding: 15px;
      margin: 10px 0;
      border-radius: 5px;
    }
    .bull {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
    }
    .base {
      background-color: #eff6ff;
      border-left: 4px solid #3b82f6;
    }
    .bear {
      background-color: #fee2e2;
      border-left: 4px solid #ef4444;
    }
    .drivers {
      margin-top: 10px;
    }
    .positive-catalysts {
      background-color: #f0fdf4;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }
    .negative-catalysts {
      background-color: #fef2f2;
      padding: 15px;
      border-radius: 5px;
      margin: 10px 0;
    }
    .catalysts-timeline {
      background-color: #f8fafc;
      padding: 15px;
      border-radius: 5px;
      margin: 15px 0;
    }
    .timeline-section {
      margin: 10px 0;
      padding-left: 10px;
      border-left: 2px solid #cbd5e1;
    }
    .disclaimer {
      margin-top: 40px;
      padding: 15px;
      background-color: #fffbeb;
      border: 1px solid #fef3c7;
      border-radius: 5px;
      font-size: 14px;
    }
    ul {
      padding-left: 20px;
    }
    li {
      margin-bottom: 5px;
    }
    .section-content {
      line-height: 1.8;
    }
  `;
};
