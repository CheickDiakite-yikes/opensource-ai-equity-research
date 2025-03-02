
import { useState } from "react";
import { Card } from "@/components/ui/card";
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
  Sparkles
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";
import { cn } from "@/lib/utils";

const Index = () => {
  const [symbol, setSymbol] = useState<string>("");
  const [searchedSymbol, setSearchedSymbol] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSearch = () => {
    if (!symbol.trim()) return;
    setIsLoading(true);
    setSearchedSymbol(symbol.toUpperCase());
    
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header with gradient */}
      <header className="border-b border-border p-4 bg-gradient-to-r from-background to-secondary/30">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            <span>AI Equity Research</span>
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
              disabled={isLoading} 
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
          <div className="space-y-8 my-12">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl font-bold mb-3">AI-Powered Stock Analysis</h2>
              <p className="text-muted-foreground">
                Utilize advanced AI tools to analyze stocks, generate comprehensive reports, 
                and predict price movements with greater accuracy.
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <Search className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Search Companies</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Enter a stock ticker symbol to begin your research
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <BarChart4 className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Analyze Fundamentals</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Get comprehensive financial data and analysis
                    </p>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 hover:shadow-md transition-all duration-300 hover:translate-y-[-4px] border-border/50 bg-card/40 backdrop-blur-sm">
                <div className="flex items-start gap-4">
                  <div className="p-2 bg-primary/10 rounded-full">
                    <FileText className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium">Generate Reports</h3>
                    <p className="text-muted-foreground mt-1 text-sm">
                      Create detailed AI-powered equity research reports
                    </p>
                  </div>
                </div>
              </Card>
            </div>
            
            <div className="max-w-2xl mx-auto mt-12 p-4 rounded-lg border border-dashed border-primary/30 bg-primary/5">
              <div className="flex gap-3 items-start">
                <div className="p-2 bg-primary/10 rounded-full">
                  <Info className="h-5 w-5 text-primary" />
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
            </div>
          </div>
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
                <Button variant="outline" size="sm" className="gap-1">
                  <Calendar className="h-4 w-4" />
                  <span>Historical Data</span>
                </Button>
                <Button variant="outline" size="sm" className="gap-1">
                  <TrendingUp className="h-4 w-4" />
                  <span>Price Prediction</span>
                </Button>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-muted-foreground hover:text-foreground"
                  onClick={() => {
                    setSearchedSymbol("");
                    setSymbol("");
                  }}
                >
                  Clear
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6 p-1 bg-muted/30">
                <TabsTrigger value="overview" className="flex items-center gap-2 py-3">
                  <Search className="h-4 w-4" />
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
