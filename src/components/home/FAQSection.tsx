
import React, { useState } from "react";
import { Info, Search, ChartLine, LineChart, FileText, HelpCircle, Plus, Minus, BookOpen, Activity, BarChart, Landmark, Award, Target, CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQSection: React.FC = () => {
  const [openCategory, setOpenCategory] = useState<string | null>("basics");
  
  const categories = [
    { id: "basics", label: "Basics", icon: BookOpen },
    { id: "search", label: "Search & Navigation", icon: Search },
    { id: "analysis", label: "Analysis Tools", icon: ChartLine },
    { id: "reports", label: "Research Reports", icon: FileText },
  ];
  
  const faqs = {
    basics: [
      {
        question: "What is DiDi Equity Research?",
        answer: "DiDi Equity Research is a standalone AI-powered equity research platform developed by DiDi Data. It provides institutional-grade financial analysis for investment professionals working in Private Equity, Venture Capital, Investment Banking, Hedge Funds, Equity Research, and Consulting. The platform combines powerful financial data with AI analysis to deliver comprehensive insights on public companies."
      },
      {
        question: "How do I get started?",
        answer: "Getting started with DiDi Equity Research is simple:\n\n1. Enter a stock ticker symbol in the search box (e.g., AAPL, MSFT, GOOG)\n2. Browse the AI-generated analysis and financial data\n3. Explore different tabs for detailed metrics on various aspects of the company\n4. Generate AI research reports for comprehensive analysis\n\nNo account is required to begin exploring the basic features of the platform."
      },
      {
        question: "Is DiDi Equity Research free to use?",
        answer: "DiDi Equity Research offers a basic version with limited features free of charge. For advanced features, custom analysis, and unlimited research reports, premium subscription plans are available that cater to different types of investment professionals and firms."
      }
    ],
    search: [
      {
        question: "How do I search for a company?",
        answer: "To search for a company, simply use the search bar at the top of the page. You can enter a company name or ticker symbol (e.g., 'Apple' or 'AAPL'). As you type, the platform will suggest matches. Select the company you're looking for from the dropdown list, or press Enter to search for the exact term you entered."
      },
      {
        question: "What information can I find about a company?",
        answer: "When you search for a company, DiDi Equity Research provides comprehensive information including:\n\n• Company overview and key statistics\n• Price performance and historical charts\n• Detailed financial statements (Income Statement, Balance Sheet, Cash Flow)\n• Growth metrics and trend analysis\n• Financial ratios and comparative analysis\n• AI-generated insights and research reports\n• Latest news and market sentiment\n• SEC filings and earnings call transcripts"
      },
      {
        question: "Can I save companies for later viewing?",
        answer: "Yes, you can save companies to your watchlist for easy access later. Simply click the star icon next to the company name or in the company overview section. Your watchlist is accessible from the main dashboard and is stored locally on your device if you're not logged in, or synced across devices if you have a DiDi Equity Research account."
      }
    ],
    analysis: [
      {
        question: "What analysis tools are available?",
        answer: "DiDi Equity Research offers a comprehensive suite of analysis tools including:\n\n• Interactive financial charts with adjustable time periods\n• Growth rate calculators and historical trend analysis\n• Ratio comparisons against industry benchmarks\n• DCF (Discounted Cash Flow) modeling tools\n• Technical analysis indicators\n• Peer comparison tools\n• AI-powered financial health scores\n• Sentiment analysis of news and social media"
      },
      {
        question: "How do I use the financial data visualization?",
        answer: "DiDi's financial visualizations are interactive and intuitive:\n\n1. Navigate to the Financials tab after searching for a company\n2. Select the specific financial statement you want to explore (Income Statement, Balance Sheet, Cash Flow)\n3. Use the time period selector to adjust the range of data displayed\n4. Hover over chart elements to see detailed figures\n5. Click on specific metrics to isolate them in the visualization\n6. Use the comparison features to benchmark against industry averages or competitors"
      },
      {
        question: "How accurate is the AI analysis?",
        answer: "DiDi's AI analysis is based on factual financial data from reliable sources combined with advanced machine learning algorithms. The analysis is designed to identify patterns, trends, and insights that might not be immediately obvious. However, it's important to note that all financial analysis, AI or otherwise, involves projections and interpretations that may not perfectly predict future performance. The platform provides confidence scores with all AI-generated insights to help you assess reliability."
      }
    ],
    reports: [
      {
        question: "How do I generate an AI research report?",
        answer: "To generate an AI research report:\n\n1. Search for a company and navigate to its overview page\n2. Click on the 'Research Report' tab\n3. Select the type of report you want to generate (Basic Analysis, Full Research Report, Investment Thesis, etc.)\n4. Customize the parameters if desired (time horizon, focus areas, etc.)\n5. Click 'Generate Report' and wait a few moments for the AI to compile the analysis\n6. Once complete, you can read, download, or share the report"
      },
      {
        question: "Can I customize the research reports?",
        answer: "Yes, DiDi Equity Research allows for extensive customization of AI-generated reports. Before generating a report, you can specify:\n\n• Report focus (e.g., financial health, growth potential, risk assessment)\n• Time horizons for projections\n• Specific financial metrics to emphasize\n• Industry comparisons to include\n• Level of technical detail\n• Report format and sections to include\n\nPremium subscribers have access to additional customization options including branded reports and custom methodologies."
      },
      {
        question: "How frequently is the data updated?",
        answer: "DiDi Equity Research updates data with the following frequency:\n\n• Market prices and basic metrics: Real-time or 15-minute delayed (depending on exchange)\n• Financial statements: Updated within 24 hours of company filings\n• News and sentiment: Updated continuously throughout the day\n• Analyst estimates: Updated as new estimates are published\n• AI insights: Recalculated with each new data point\n\nThe last update time is displayed on each data section so you always know how current the information is."
      }
    ]
  };
  
  const handleCategoryChange = (categoryId: string) => {
    setOpenCategory(categoryId === openCategory ? null : categoryId);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="w-full mx-auto mt-12 mb-16 px-4"
    >
      {/* Header */}
      <div className="text-center mb-10">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-block p-2 bg-primary/10 rounded-full mb-3"
        >
          <HelpCircle className="h-8 w-8 text-primary" />
        </motion.div>
        <h2 className="text-3xl font-bold mb-3">Frequently Asked Questions</h2>
        <p className="text-muted-foreground max-w-3xl mx-auto">
          Everything you need to know about using DiDi Equity Research for professional-grade financial analysis and AI-powered insights.
        </p>
      </div>
      
      {/* Category Tabs */}
      <div className="flex flex-wrap justify-center gap-2 mb-8">
        {categories.map((category) => {
          const Icon = category.icon;
          return (
            <button
              key={category.id}
              className={`flex items-center gap-2 px-4 py-2 rounded-full border transition-colors ${
                openCategory === category.id 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-transparent hover:bg-primary/10 border-border"
              }`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <Icon size={18} />
              <span>{category.label}</span>
            </button>
          );
        })}
      </div>
      
      {/* FAQ Accordion */}
      <div className="max-w-5xl mx-auto bg-card rounded-xl shadow-sm border p-1">
        {openCategory && faqs[openCategory as keyof typeof faqs].map((faq, index) => (
          <Accordion key={index} type="single" collapsible className="w-full">
            <AccordionItem value={`item-${index}`} className="border-b border-border/50 last:border-0">
              <AccordionTrigger className="py-4 px-4 text-left font-medium hover:bg-muted/30 rounded-lg text-foreground">
                {faq.question}
              </AccordionTrigger>
              <AccordionContent className="px-6 pb-4 pt-2 text-muted-foreground whitespace-pre-line">
                {faq.answer}
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        ))}
      </div>
      
      {/* Quick Reference Guide */}
      <div className="max-w-5xl mx-auto mt-16 p-6 rounded-xl border border-border/60 bg-gradient-to-br from-card to-muted/20">
        <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-primary" />
          Quick Reference Guide
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">1</span>
              </div>
              <div>
                <h4 className="font-medium">Enter a ticker symbol</h4>
                <p className="text-sm text-muted-foreground">Search using stock tickers like AAPL, MSFT, GOOG</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">2</span>
              </div>
              <div>
                <h4 className="font-medium">Explore company overview</h4>
                <p className="text-sm text-muted-foreground">Review key financials and recent performance metrics</p>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">3</span>
              </div>
              <div>
                <h4 className="font-medium">Analyze financial data</h4>
                <p className="text-sm text-muted-foreground">Use interactive charts and detailed metric breakdowns</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="mt-0.5 flex-shrink-0 h-6 w-6 rounded-full bg-primary/20 flex items-center justify-center">
                <span className="text-primary text-sm font-medium">4</span>
              </div>
              <div>
                <h4 className="font-medium">Generate AI reports</h4>
                <p className="text-sm text-muted-foreground">Get comprehensive analysis and price targets</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQSection;
