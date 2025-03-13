
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
        answer: "DiDi Equity Research is a standalone AI-powered equity research platform developed by DiDi Data. It provides institutional-grade financial analysis for investment professionals working in Private Equity, Venture Capital, Investment Banking, Hedge Funds, Equity Research, and Consulting. The platform combines financial data with AI analysis to deliver comprehensive insights on public companies."
      },
      {
        question: "How do I get started?",
        answer: "Getting started with DiDi Equity Research is simple:\n\n1. Enter a stock ticker symbol in the search box (e.g., AAPL, MSFT, GOOG)\n2. Browse the company information and financial data\n3. Explore different sections for detailed metrics\n4. View AI-generated insights when available\n\nNo account is required to begin exploring the platform."
      },
      {
        question: "What companies can I research?",
        answer: "You can research publicly traded companies listed on major exchanges. Simply enter the ticker symbol (e.g., AAPL for Apple, MSFT for Microsoft) in the search bar to access available information. The platform currently focuses on companies with sufficient public financial data."
      }
    ],
    search: [
      {
        question: "How do I search for a company?",
        answer: "To search for a company, simply use the search bar at the top of the page. You can enter a company name or ticker symbol (e.g., 'Apple' or 'AAPL'). As you type, the platform will suggest matches. Select the company you're looking for from the dropdown list, or press Enter to search for the exact term you entered."
      },
      {
        question: "What information can I find about a company?",
        answer: "When you search for a company, DiDi Equity Research provides comprehensive information including:\n\n• Company overview and key statistics\n• Price performance data\n• Financial statements (Income Statement, Balance Sheet, Cash Flow)\n• Growth metrics and ratios\n• Financial analysis tools\n• Market news and relevant information"
      },
      {
        question: "Can I compare companies?",
        answer: "Currently, you can research one company at a time. Our roadmap includes plans to add comparative analysis features in future updates, allowing you to benchmark companies against competitors or industry averages. For now, you can manually compare companies by searching for them individually."
      }
    ],
    analysis: [
      {
        question: "What analysis tools are available?",
        answer: "DiDi Equity Research offers several analysis tools including:\n\n• Interactive financial charts\n• Financial statement visualization\n• Growth rate analysis\n• Key financial ratios\n• Financial health indicators\n• AI-powered insights where available"
      },
      {
        question: "How do I use the financial data visualization?",
        answer: "To view financial visualizations:\n\n1. Search for a company using its ticker symbol\n2. Navigate to the Financials or Analysis sections\n3. Browse through the various charts and data presentations\n4. Interact with the visualizations to focus on specific metrics or time periods"
      },
      {
        question: "Where does the data come from?",
        answer: "DiDi Equity Research aggregates financial data from reliable public sources, including company filings, market data providers, and other public financial information. The platform processes this data and presents it in an accessible format, sometimes supplemented with AI-generated insights based on the raw financial figures."
      }
    ],
    reports: [
      {
        question: "What are AI research reports?",
        answer: "AI research reports are automatically generated analyses of a company based on its financial data and market position. These reports provide insights on a company's financial health, growth trajectory, and key metrics that might influence investment decisions. The AI aims to highlight important trends and patterns in the data."
      },
      {
        question: "How accurate are the AI insights?",
        answer: "AI insights are based on factual financial data, but include interpretations and projections that should be treated as one perspective among many. While our AI strives for accuracy, all financial analysis involves assumptions and limitations. We recommend using AI insights as a starting point for your research, not as the sole basis for investment decisions."
      },
      {
        question: "Can I download or share insights?",
        answer: "Currently, the platform allows you to view insights within the application. We're working on adding features to download, save, or share specific analyses in future updates. For now, you can manually save information using your browser's screenshot tools or by copying text content."
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
                <h4 className="font-medium">View AI insights</h4>
                <p className="text-sm text-muted-foreground">Get analysis on company performance and trends</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FAQSection;
