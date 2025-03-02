
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { 
  Search, 
  BarChart4, 
  FileText, 
  TrendingUp,
  Calendar,
  ChevronRight,
  ArrowRight,
  Info,
  Briefcase,
  Sparkles,
  Globe,
  TrendingDown,
  Star,
  CheckCircle2,
  BarChart,
  Shield
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

const Index = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [featuredSymbols] = useState<{symbol: string, name: string}[]>([
    { symbol: "AAPL", name: "Apple Inc." },
    { symbol: "MSFT", name: "Microsoft Corp." },
    { symbol: "AMZN", name: "Amazon.com Inc." },
    { symbol: "GOOG", name: "Alphabet Inc." },
    { symbol: "META", name: "Meta Platforms Inc." },
    { symbol: "TSLA", name: "Tesla Inc." }
  ]);

  // Load recent searches from localStorage on component mount
  useEffect(() => {
    const savedSearches = localStorage.getItem('recentSearches');
    if (savedSearches) {
      setRecentSearches(JSON.parse(savedSearches));
    }
  }, []);

  const handleSearch = () => {
    if (!symbol.trim()) return;
    
    const symbolUpperCase = symbol.toUpperCase();
    setIsLoading(true);
    setSearchedSymbol(symbolUpperCase);
    
    // Update recent searches
    const updatedSearches = [
      symbolUpperCase,
      ...recentSearches.filter(s => s !== symbolUpperCase)
    ].slice(0, 5); // Keep only the 5 most recent
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setSearchedSymbol("");
    setSymbol("");
  };

  const searchSymbol = (sym: string) => {
    setSymbol(sym);
    setSearchedSymbol(sym);
    
    // Update recent searches
    const updatedSearches = [
      sym,
      ...recentSearches.filter(s => s !== sym)
    ].slice(0, 5);
    
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="border-b border-border p-4 bg-gradient-to-r from-background to-secondary/30">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <img 
              src="/lovable-uploads/253c2c77-f09d-4088-83eb-0299dfaf98f2.png" 
              alt="DiDi Equity Research" 
              className="h-10"
            />
            <span>Equity Research</span>
          </h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search ticker symbol..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10 bg-background/80 backdrop-blur-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isLoading || !symbol.trim()} 
              size="sm"
              className="gap-1"
            >
              {isLoading ? (
                "Searching..."
              ) : (
                <>
                  Search
                  <ChevronRight className="h-3.5 w-3.5" />
                </>
              )}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {!searchedSymbol ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-10 my-12"
          >
            <div className="text-center max-w-3xl mx-auto">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1, duration: 0.5 }}
              >
                <h2 className="text-3xl font-bold mb-4">AI-Powered Stock Analysis Platform</h2>
                <p className="text-muted-foreground text-lg">
                  Utilize advanced AI tools to analyze stocks, generate comprehensive reports, 
                  and predict price movements with greater accuracy.
                </p>
              </motion.div>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
            >
              <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-primary" />
                Featured Companies
              </h3>
              <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
                {featuredSymbols.map((item) => (
                  <Card 
                    key={item.symbol}
                    className="cursor-pointer hover:border-primary/50 transition-all duration-200"
                    onClick={() => searchSymbol(item.symbol)}
                  >
                    <CardContent className="p-4 text-center">
                      <div className="font-bold text-lg">{item.symbol}</div>
                      <div className="text-sm text-muted-foreground">{item.name}</div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="grid gap-6 md:grid-cols-3"
            >
              <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <BarChart4 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Comprehensive Analysis</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Access detailed financial data including income statements, balance sheets, cash flows, and key ratios
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Financial Ratios</span>
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Growth Analysis</span>
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">DCF Valuation</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">AI Research Reports</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Generate detailed research reports with investment theses, valuation models, and recommendations
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Investment Analysis</span>
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Risk Assessment</span>
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Recommendations</span>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Price Predictions</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Get AI-powered stock price forecasts with potential upside/downside and confidence levels
                    </p>
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Short-Term</span>
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Mid-Term</span>
                      <span className="px-2 py-0.5 bg-muted text-xs rounded-full">Long-Term</span>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
            
            {recentSearches.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
              >
                <h3 className="text-lg font-medium mb-4 flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-primary" />
                  Recent Searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((sym) => (
                    <Button
                      key={sym}
                      variant="outline"
                      size="sm"
                      className="gap-1"
                      onClick={() => searchSymbol(sym)}
                    >
                      <Briefcase className="h-4 w-4 text-primary" />
                      {sym}
                    </Button>
                  ))}
                </div>
              </motion.div>
            )}
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.5 }}
              className="max-w-3xl mx-auto mt-12 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5"
            >
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Shield className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-base font-medium mb-1">How to use</h3>
                  <ol className="space-y-2 text-sm text-muted-foreground list-decimal pl-5">
                    <li>Enter a stock ticker symbol in the search box (e.g., AAPL, MSFT, GOOG)</li>
                    <li>Explore company overview including key financials and recent performance</li>
                    <li>Analyze financial data with interactive charts and detailed metrics</li>
                    <li>Generate AI research reports to get comprehensive analysis and price targets</li>
                  </ol>
                </div>
              </div>
            </motion.div>
          </motion.div>
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold flex items-center gap-2">
                  <Briefcase className="h-5 w-5 text-primary" />
                  {searchedSymbol}
                </h2>
                <p className="text-muted-foreground">Equity Research & Analysis</p>
              </div>
              <div className="flex items-center gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => window.open(`https://finance.yahoo.com/quote/${searchedSymbol}`, '_blank')}
                >
                  <Globe className="h-4 w-4" />
                  <span>External Data</span>
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="gap-1"
                  onClick={() => window.open(`https://finance.yahoo.com/quote/${searchedSymbol}/history`, '_blank')}
                >
                  <Calendar className="h-4 w-4" />
                  <span>Historical Data</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={clearSearch}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-muted/30">
                <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                  <Briefcase className="h-4 w-4" />
                  <span>Overview</span>
                </TabsTrigger>
                <TabsTrigger value="analysis" className="flex items-center gap-2 py-3">
                  <BarChart4 className="h-4 w-4" />
                  <span>Analysis</span>
                </TabsTrigger>
                <TabsTrigger value="report" className="flex items-center gap-2 py-3">
                  <FileText className="h-4 w-4" />
                  <span>Research Report</span>
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="mt-4 animate-fade-in">
                <StockOverview symbol={searchedSymbol} />
              </TabsContent>
              <TabsContent value="analysis" className="mt-4 animate-fade-in">
                <StockAnalysis symbol={searchedSymbol} />
              </TabsContent>
              <TabsContent value="report" className="mt-4 animate-fade-in">
                <ResearchReportGenerator symbol={searchedSymbol} />
              </TabsContent>
            </Tabs>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;
