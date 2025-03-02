
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
import { formatCurrency, formatLargeNumber, getPercentStyle } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

interface StockAnalysisProps {
  symbol: string;
}

const StockAnalysis = ({ symbol }: StockAnalysisProps) => {
  const [isLoading, setIsLoading] = useState(true);
  const [financials, setFinancials] = useState<any[]>([]);
  const [ratios, setRatios] = useState<any[]>([]);

  useEffect(() => {
    const fetchFinancialData = async () => {
      try {
        console.log(`Fetching financial data for ${symbol}`);
        setIsLoading(true);
        
        // This would be replaced with actual API calls
        // For demo purposes, using mock data
        setTimeout(() => {
          setFinancials(mockFinancialData);
          setRatios(mockRatioData);
          setIsLoading(false);
        }, 1500);
      } catch (error) {
        console.error("Error fetching financial data:", error);
        setIsLoading(false);
      }
    };

    if (symbol) {
      fetchFinancialData();
    }
  }, [symbol]);

  if (isLoading) {
    return <LoadingSkeleton />;
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
            {ratios.map((ratio, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base">{ratio.year}</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">P/E Ratio</dt>
                      <dd className="font-medium">{ratio.peRatio.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">P/B Ratio</dt>
                      <dd className="font-medium">{ratio.pbRatio.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">ROE</dt>
                      <dd className="font-medium">{(ratio.roe * 100).toFixed(2)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">ROA</dt>
                      <dd className="font-medium">{(ratio.roa * 100).toFixed(2)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Current Ratio</dt>
                      <dd className="font-medium">{ratio.currentRatio.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Debt/Equity</dt>
                      <dd className="font-medium">{ratio.debtToEquity.toFixed(2)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Gross Margin</dt>
                      <dd className="font-medium">{(ratio.grossMargin * 100).toFixed(2)}%</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Net Margin</dt>
                      <dd className="font-medium">{(ratio.netMargin * 100).toFixed(2)}%</dd>
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
                <LineChart data={ratios}>
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="metric-card">
                  <span className="metric-label">Revenue CAGR</span>
                  <span className="metric-value">12.8%</span>
                  <span className="mt-1 text-xs text-green-600">
                    Above Industry Average (8.5%)
                  </span>
                </div>
                
                <div className="metric-card">
                  <span className="metric-label">EPS CAGR</span>
                  <span className="metric-value">15.2%</span>
                  <span className="mt-1 text-xs text-green-600">
                    Above Industry Average (9.4%)
                  </span>
                </div>
                
                <div className="metric-card">
                  <span className="metric-label">Free Cash Flow CAGR</span>
                  <span className="metric-value">10.5%</span>
                  <span className="mt-1 text-xs text-green-600">
                    Above Industry Average (7.2%)
                  </span>
                </div>
              </div>
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
    if (index === 0) {
      return { year: item.year, growth: 0 };
    }
    
    const previousValue = data[index - 1][key];
    const currentValue = item[key];
    const growth = previousValue !== 0 
      ? ((currentValue - previousValue) / Math.abs(previousValue)) * 100 
      : 0;
      
    return {
      year: item.year,
      growth
    };
  }).slice(1); // Remove the first item since it has no growth rate
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

// Mock Financial Data
const mockFinancialData = [
  {
    year: "2019",
    revenue: 9500000000,
    costOfRevenue: 5700000000,
    grossProfit: 3800000000,
    operatingExpenses: 2300000000,
    operatingIncome: 1500000000,
    netIncome: 1200000000,
    eps: 3.15,
    totalAssets: 15000000000,
    totalLiabilities: 8000000000,
    totalEquity: 7000000000,
  },
  {
    year: "2020",
    revenue: 10200000000,
    costOfRevenue: 6000000000,
    grossProfit: 4200000000,
    operatingExpenses: 2500000000,
    operatingIncome: 1700000000,
    netIncome: 1350000000,
    eps: 3.52,
    totalAssets: 16500000000,
    totalLiabilities: 8700000000,
    totalEquity: 7800000000,
  },
  {
    year: "2021",
    revenue: 11800000000,
    costOfRevenue: 6800000000,
    grossProfit: 5000000000,
    operatingExpenses: 2900000000,
    operatingIncome: 2100000000,
    netIncome: 1650000000,
    eps: 4.25,
    totalAssets: 18500000000,
    totalLiabilities: 9200000000,
    totalEquity: 9300000000,
  },
  {
    year: "2022",
    revenue: 13500000000,
    costOfRevenue: 7700000000,
    grossProfit: 5800000000,
    operatingExpenses: 3200000000,
    operatingIncome: 2600000000,
    netIncome: 2000000000,
    eps: 5.10,
    totalAssets: 21000000000,
    totalLiabilities: 10500000000,
    totalEquity: 10500000000,
  },
  {
    year: "2023",
    revenue: 15400000000,
    costOfRevenue: 8600000000,
    grossProfit: 6800000000,
    operatingExpenses: 3600000000,
    operatingIncome: 3200000000,
    netIncome: 2450000000,
    eps: 6.18,
    totalAssets: 24500000000,
    totalLiabilities: 12000000000,
    totalEquity: 12500000000,
  }
];

// Mock Ratio Data
const mockRatioData = [
  {
    year: "2019",
    peRatio: 18.5,
    pbRatio: 2.8,
    roe: 0.171,
    roa: 0.08,
    currentRatio: 1.8,
    debtToEquity: 0.9,
    grossMargin: 0.4,
    operatingMargin: 0.158,
    netMargin: 0.126,
  },
  {
    year: "2020",
    peRatio: 20.2,
    pbRatio: 3.1,
    roe: 0.173,
    roa: 0.082,
    currentRatio: 1.9,
    debtToEquity: 0.85,
    grossMargin: 0.412,
    operatingMargin: 0.167,
    netMargin: 0.132,
  },
  {
    year: "2021",
    peRatio: 22.8,
    pbRatio: 3.4,
    roe: 0.177,
    roa: 0.089,
    currentRatio: 2.0,
    debtToEquity: 0.75,
    grossMargin: 0.424,
    operatingMargin: 0.178,
    netMargin: 0.14,
  },
  {
    year: "2022",
    peRatio: 24.1,
    pbRatio: 3.6,
    roe: 0.19,
    roa: 0.095,
    currentRatio: 2.1,
    debtToEquity: 0.7,
    grossMargin: 0.43,
    operatingMargin: 0.193,
    netMargin: 0.148,
  },
  {
    year: "2023",
    peRatio: 25.5,
    pbRatio: 3.8,
    roe: 0.196,
    roa: 0.1,
    currentRatio: 2.2,
    debtToEquity: 0.65,
    grossMargin: 0.442,
    operatingMargin: 0.208,
    netMargin: 0.159,
  }
];

export default StockAnalysis;
