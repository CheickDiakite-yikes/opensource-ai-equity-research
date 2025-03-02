
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { 
  Search, 
  BarChart4, 
  FileText, 
  TrendingUp,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import StockOverview from "@/components/StockOverview";
import StockAnalysis from "@/components/StockAnalysis";
import ResearchReportGenerator from "@/components/ResearchReportGenerator";

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
      {/* Header */}
      <header className="border-b border-border p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold">AI Equity Research</h1>
          <div className="flex items-center gap-4">
            <div className="relative w-64">
              <Input
                type="text"
                placeholder="Search ticker symbol..."
                value={symbol}
                onChange={(e) => setSymbol(e.target.value)}
                onKeyDown={handleKeyDown}
                className="pl-10"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
            <Button onClick={handleSearch} disabled={isLoading} size="sm">
              {isLoading ? "Searching..." : "Search"}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-6">
        {!searchedSymbol ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 my-12">
            <Card className="p-6 hover:shadow-md transition-shadow">
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
            
            <Card className="p-6 hover:shadow-md transition-shadow">
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
            
            <Card className="p-6 hover:shadow-md transition-shadow">
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
        ) : (
          <div className="mt-6">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold">{searchedSymbol}</h2>
                <p className="text-muted-foreground">Equity Research & Analysis</p>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  Historical Data
                </Button>
                <Button variant="outline" size="sm">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Price Prediction
                </Button>
              </div>
            </div>
            
            <Tabs defaultValue="overview" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="analysis">Analysis</TabsTrigger>
                <TabsTrigger value="report">Research Report</TabsTrigger>
              </TabsList>
              <TabsContent value="overview" className="mt-4">
                <StockOverview symbol={searchedSymbol} />
              </TabsContent>
              <TabsContent value="analysis" className="mt-4">
                <StockAnalysis symbol={searchedSymbol} />
              </TabsContent>
              <TabsContent value="report" className="mt-4">
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
