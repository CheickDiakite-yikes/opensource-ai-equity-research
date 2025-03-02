import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar
} from "recharts";
import { formatCurrency, formatLargeNumber } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { fetchIncomeStatements, fetchBalanceSheets, fetchKeyRatios } from "@/services/api";
import type { IncomeStatement, BalanceSheet, KeyRatio } from "@/types";

interface StockAnalysisProps {
  symbol: string;
}

const StockAnalysis = ({ symbol }: StockAnalysisProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [income, setIncome] = useState<IncomeStatement[]>([]);
  const [balance, setBalance] = useState<BalanceSheet[]>([]);
  const [ratios, setRatios] = useState<KeyRatio[]>([]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const [incomeData, balanceData, ratiosData] = await Promise.all([
          fetchIncomeStatements(symbol),
          fetchBalanceSheets(symbol),
          fetchKeyRatios(symbol)
        ]);
        
        // Sort data by date for consistency (newest to oldest)
        const sortedIncome = [...incomeData].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const sortedBalance = [...balanceData].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        const sortedRatios = [...ratiosData].sort((a, b) => 
          new Date(b.date).getTime() - new Date(a.date).getTime()
        );
        
        setIncome(sortedIncome);
        setBalance(sortedBalance);
        setRatios(sortedRatios);
      } catch (err) {
        console.error("Error fetching financial data:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchFinancialData();
    }
  }, [symbol]);

  // Prepare data for charts
  const prepareFinancialData = () => {
    if (income.length === 0) return [];
    
    return income.map((inc, index) => {
      // Safely access balance sheet data with fallbacks
      const bal = balance[index] || {};
      const year = new Date(inc.date).getFullYear().toString();
      
      return {
        year,
        revenue: inc.revenue,
        costOfRevenue: inc.costOfRevenue,
        grossProfit: inc.grossProfit,
        operatingExpenses: inc.operatingExpenses || (inc.sellingGeneralAndAdministrativeExpenses + (inc.researchAndDevelopmentExpenses || 0)),
        operatingIncome: inc.operatingIncome,
        netIncome: inc.netIncome,
        eps: inc.eps,
        totalAssets: bal.totalAssets || 0, // Added fallback
        totalLiabilities: bal.totalLiabilities || 0, // Added fallback
        totalEquity: bal.totalStockholdersEquity || 0 // Added fallback
      };
    });
  };

  const prepareRatioData = () => {
    if (ratios.length === 0) return [];
    
    return ratios.map(ratio => {
      const year = new Date(ratio.date).getFullYear().toString();
      
      return {
        year,
        peRatio: ratio.priceEarningsRatio,
        pbRatio: ratio.priceToBookRatio,
        roe: ratio.returnOnEquity,
        roa: ratio.returnOnAssets,
        currentRatio: ratio.currentRatio,
        debtToEquity: ratio.debtEquityRatio,
        grossMargin: ratio.grossProfitMargin,
        operatingMargin: ratio.operatingProfitMargin,
        netMargin: ratio.netProfitMargin
      };
    });
  };

  const financials = prepareFinancialData();
  const ratioData = prepareRatioData();

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (error || financials.length === 0) {
    return (
      <Card className="p-6">
        <div className="text-center py-8">
          <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Financial Data</h3>
          <p className="text-muted-foreground">{error || `No financial data available for ${symbol}`}</p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="financials" className="w-full">
        <TabsList>
          <TabsTrigger value="financials">Financial Statements</TabsTrigger>
          <TabsTrigger value="ratios">Financial Ratios</TabsTrigger>
          <TabsTrigger value="growth">Growth Analysis</TabsTrigger>
        </TabsList>
        
        <TabsContent value="financials" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue vs Net Income</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={financials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Bar dataKey="revenue" fill="#3B82F6" name="Revenue" />
                    <Bar dataKey="netIncome" fill="#10B981" name="Net Income" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Assets vs Liabilities</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={financials}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis />
                    <Tooltip 
                      formatter={(value: number) => [formatCurrency(value), ""]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalAssets" 
                      stroke="#3B82F6" 
                      name="Total Assets"
                      strokeWidth={2}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="totalLiabilities" 
                      stroke="#EF4444" 
                      name="Total Liabilities"
                      strokeWidth={2}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Income Statement Trends</CardTitle>
            </CardHeader>
            <div className="px-4 overflow-auto">
              <table className="w-full financial-table">
                <thead>
                  <tr className="border-b">
                    <th className="text-left">Metric</th>
                    {financials.map((item) => (
                      <th key={item.year} className="text-right">{item.year}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Revenue</td>
                    {financials.map((item) => (
                      <td key={`revenue-${item.year}`} className="text-right">
                        {formatCurrency(item.revenue)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Cost of Revenue</td>
                    {financials.map((item) => (
                      <td key={`costOfRevenue-${item.year}`} className="text-right">
                        {formatCurrency(item.costOfRevenue)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Gross Profit</td>
                    {financials.map((item) => (
                      <td key={`grossProfit-${item.year}`} className="text-right">
                        {formatCurrency(item.grossProfit)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Operating Expenses</td>
                    {financials.map((item) => (
                      <td key={`operatingExpenses-${item.year}`} className="text-right">
                        {formatCurrency(item.operatingExpenses)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Operating Income</td>
                    {financials.map((item) => (
                      <td key={`operatingIncome-${item.year}`} className="text-right">
                        {formatCurrency(item.operatingIncome)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>Net Income</td>
                    {financials.map((item) => (
                      <td key={`netIncome-${item.year}`} className="text-right">
                        {formatCurrency(item.netIncome)}
                      </td>
                    ))}
                  </tr>
                  <tr>
                    <td>EPS</td>
                    {financials.map((item) => (
                      <td key={`eps-${item.year}`} className="text-right">
                        {item.eps.toFixed(2)}
                      </td>
                    ))}
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>
        </TabsContent>
        
        <TabsContent value="ratios" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ratioData.map((ratio, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{ratio.year}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">P/E Ratio</dt>
                      <dd className="font-medium">{ratio.peRatio?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">P/B Ratio</dt>
                      <dd className="font-medium">{ratio.pbRatio?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">ROE</dt>
                      <dd className="font-medium">{ratio.roe ? (ratio.roe * 100).toFixed(2) + '%' : 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">ROA</dt>
                      <dd className="font-medium">{ratio.roa ? (ratio.roa * 100).toFixed(2) + '%' : 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Current Ratio</dt>
                      <dd className="font-medium">{ratio.currentRatio?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Debt/Equity</dt>
                      <dd className="font-medium">{ratio.debtToEquity?.toFixed(2) || 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Gross Margin</dt>
                      <dd className="font-medium">{ratio.grossMargin ? (ratio.grossMargin * 100).toFixed(2) + '%' : 'N/A'}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Net Margin</dt>
                      <dd className="font-medium">{ratio.netMargin ? (ratio.netMargin * 100).toFixed(2) + '%' : 'N/A'}</dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            ))}
          </div>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Profitability Trends</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={ratioData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="year" />
                  <YAxis tickFormatter={(value) => `${(value * 100).toFixed(0)}%`} />
                  <Tooltip 
                    formatter={(value: number) => [(value * 100).toFixed(2) + "%", ""]}
                    labelFormatter={(label) => `Year: ${label}`}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="grossMargin" 
                    stroke="#3B82F6" 
                    name="Gross Margin"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="operatingMargin" 
                    stroke="#10B981" 
                    name="Operating Margin"
                    strokeWidth={2}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="netMargin" 
                    stroke="#8B5CF6" 
                    name="Net Margin"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="growth" className="mt-4 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Revenue Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculateGrowth(financials, 'revenue')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)}%`, "YoY Growth"]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Bar dataKey="growth" fill="#3B82F6" name="Revenue Growth YoY" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Earnings Growth</CardTitle>
              </CardHeader>
              <CardContent className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={calculateGrowth(financials, 'netIncome')}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="year" />
                    <YAxis tickFormatter={(value) => `${value}%`} />
                    <Tooltip 
                      formatter={(value: number) => [`${value.toFixed(2)}%`, "YoY Growth"]}
                      labelFormatter={(label) => `Year: ${label}`}
                    />
                    <Bar dataKey="growth" fill="#10B981" name="Earnings Growth YoY" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>5-Year Growth Rates</CardTitle>
            </CardHeader>
            <CardContent>
              {financials.length >= 2 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-4 border rounded-lg">
                    <span className="block text-sm text-muted-foreground mb-1">Revenue CAGR</span>
                    <span className="text-xl font-semibold block">
                      {calculateCAGR(financials, 'revenue').toFixed(2)}%
                    </span>
                    <span className="mt-1 text-xs text-green-600 block">
                      {compareToIndustry(calculateCAGR(financials, 'revenue'), 8.5)}
                    </span>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <span className="block text-sm text-muted-foreground mb-1">EPS CAGR</span>
                    <span className="text-xl font-semibold block">
                      {calculateCAGR(financials, 'eps').toFixed(2)}%
                    </span>
                    <span className="mt-1 text-xs text-green-600 block">
                      {compareToIndustry(calculateCAGR(financials, 'eps'), 9.4)}
                    </span>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <span className="block text-sm text-muted-foreground mb-1">Net Income CAGR</span>
                    <span className="text-xl font-semibold block">
                      {calculateCAGR(financials, 'netIncome').toFixed(2)}%
                    </span>
                    <span className="mt-1 text-xs text-green-600 block">
                      {compareToIndustry(calculateCAGR(financials, 'netIncome'), 7.2)}
                    </span>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-6">
                  Insufficient historical data to calculate growth rates
                </p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

// Helper function to calculate year-over-year growth
const calculateGrowth = (data: any[], key: string) => {
  return data.map((item, index) => {
    if (index === data.length - 1) {
      return { year: item.year, growth: 0 };
    }
    
    const currentValue = item[key];
    const nextValue = data[index + 1][key];
    const growth = nextValue !== 0 
      ? ((currentValue - nextValue) / Math.abs(nextValue)) * 100 
      : 0;
      
    return {
      year: item.year,
      growth
    };
  }).filter((item, index) => index < data.length - 1);
};

// Calculate Compound Annual Growth Rate (CAGR)
const calculateCAGR = (data: any[], key: string) => {
  if (data.length < 2) return 0;
  
  const newest = data[0][key];
  const oldest = data[data.length - 1][key];
  const years = data.length - 1;
  
  if (oldest <= 0 || newest <= 0) return 0;
  
  return ((Math.pow(newest / oldest, 1 / years) - 1) * 100);
};

// Compare to industry average
const compareToIndustry = (value: number, industryAvg: number) => {
  if (value > industryAvg) {
    return `Above Industry Average (${industryAvg.toFixed(1)}%)`;
  } else if (value < industryAvg) {
    return `Below Industry Average (${industryAvg.toFixed(1)}%)`;
  } else {
    return `At Industry Average (${industryAvg.toFixed(1)}%)`;
  }
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="h-10 flex space-x-2">
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
      <Skeleton className="h-10 w-24" />
    </div>
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Skeleton className="h-80 w-full" />
      <Skeleton className="h-80 w-full" />
    </div>
    <Skeleton className="h-80 w-full" />
  </div>
);

export default StockAnalysis;
