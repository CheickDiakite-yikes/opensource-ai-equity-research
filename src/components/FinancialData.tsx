
import { useState } from "react";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { cn, formatCurrency, formatLargeNumber, formatDate } from "@/lib/utils";
import { IncomeStatement, BalanceSheet, CashFlowStatement, KeyRatio } from "@/types";
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';

interface FinancialDataProps {
  income: IncomeStatement[];
  balance: BalanceSheet[];
  cashflow: CashFlowStatement[];
  ratios: KeyRatio[];
  className?: string;
}

const FinancialData = ({
  income,
  balance,
  cashflow,
  ratios,
  className
}: FinancialDataProps) => {
  const [view, setView] = useState<"table" | "chart">("chart");
  
  // Prepare data for charts
  const prepareChartData = () => {
    return income.slice().reverse().map((statement) => ({
      date: statement.date?.split('-')[0] || statement.calendarYear,
      revenue: statement.revenue,
      netIncome: statement.netIncome,
      grossProfit: statement.grossProfit,
      operatingIncome: statement.operatingIncome,
      eps: statement.eps,
    }));
  };
  
  const chartData = prepareChartData();
  
  // Format income statement row
  const formatIncomeRow = (statement: IncomeStatement) => {
    const date = statement.date?.split('-')[0] || statement.calendarYear;
    return {
      date,
      revenue: formatLargeNumber(statement.revenue),
      costOfRevenue: formatLargeNumber(statement.costOfRevenue),
      grossProfit: formatLargeNumber(statement.grossProfit),
      operatingExpenses: formatLargeNumber(statement.operatingExpenses),
      operatingIncome: formatLargeNumber(statement.operatingIncome),
      netIncome: formatLargeNumber(statement.netIncome),
      eps: statement.eps?.toFixed(2) || 'N/A'
    };
  };
  
  // Format balance sheet row
  const formatBalanceRow = (statement: BalanceSheet) => {
    const date = statement.date?.split('-')[0] || statement.calendarYear;
    return {
      date,
      totalAssets: formatLargeNumber(statement.totalAssets),
      totalLiabilities: formatLargeNumber(statement.totalLiabilities),
      totalEquity: formatLargeNumber(statement.totalStockholdersEquity),
      cashAndEquivalents: formatLargeNumber(statement.cashAndCashEquivalents),
      longTermDebt: formatLargeNumber(statement.longTermDebt),
      totalCurrentAssets: formatLargeNumber(statement.totalCurrentAssets),
      totalCurrentLiabilities: formatLargeNumber(statement.totalCurrentLiabilities)
    };
  };
  
  // Format cash flow row
  const formatCashFlowRow = (statement: CashFlowStatement) => {
    const date = statement.date?.split('-')[0] || statement.calendarYear;
    return {
      date,
      operatingCashFlow: formatLargeNumber(statement.operatingCashFlow),
      capitalExpenditure: formatLargeNumber(statement.capitalExpenditure),
      freeCashFlow: formatLargeNumber(statement.freeCashFlow),
      dividendsPaid: formatLargeNumber(statement.dividendsPaid || 0),
      netChangeInCash: formatLargeNumber(statement.netChangeInCash)
    };
  };
  
  // Format ratio row
  const formatRatioRow = (ratio: KeyRatio) => {
    const date = ratio.date?.split('-')[0] || ratio.date;
    return {
      date,
      pe: ratio.priceEarningsRatio?.toFixed(2) || 'N/A',
      roe: ratio.returnOnEquity ? (ratio.returnOnEquity * 100).toFixed(2) + '%' : 'N/A',
      roa: ratio.returnOnAssets ? (ratio.returnOnAssets * 100).toFixed(2) + '%' : 'N/A',
      currentRatio: ratio.currentRatio?.toFixed(2) || 'N/A',
      debtToEquity: ratio.debtEquityRatio?.toFixed(2) || 'N/A',
      grossMargin: ratio.grossProfitMargin ? (ratio.grossProfitMargin * 100).toFixed(2) + '%' : 'N/A',
      netMargin: ratio.netProfitMargin ? (ratio.netProfitMargin * 100).toFixed(2) + '%' : 'N/A'
    };
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Financial Data</h2>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setView("chart")}
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              view === "chart"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Chart
          </button>
          <button
            onClick={() => setView("table")}
            className={cn(
              "px-3 py-1 text-sm rounded-md",
              view === "table"
                ? "bg-primary text-primary-foreground"
                : "bg-secondary text-secondary-foreground"
            )}
          >
            Table
          </button>
        </div>
      </div>

      <Tabs defaultValue="income" className="w-full">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="balance">Balance Sheet</TabsTrigger>
          <TabsTrigger value="cashflow">Cash Flow</TabsTrigger>
          <TabsTrigger value="ratios">Ratios</TabsTrigger>
        </TabsList>
        
        <TabsContent value="income" className="space-y-4">
          {view === "chart" ? (
            <Card>
              <CardHeader>
                <CardTitle>Revenue & Income Trends</CardTitle>
                <CardDescription>Historical revenue and income performance</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={chartData}
                      margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => formatLargeNumber(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stackId="1"
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="grossProfit" 
                        stackId="2"
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="netIncome" 
                        stackId="3" 
                        stroke="#6366F1" 
                        fill="#6366F1"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Cost of Revenue</TableHead>
                      <TableHead>Gross Profit</TableHead>
                      <TableHead>Operating Expenses</TableHead>
                      <TableHead>Operating Income</TableHead>
                      <TableHead>Net Income</TableHead>
                      <TableHead>EPS</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {income.map((statement) => {
                      const row = formatIncomeRow(statement);
                      return (
                        <TableRow key={statement.date}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.revenue}</TableCell>
                          <TableCell>{row.costOfRevenue}</TableCell>
                          <TableCell>{row.grossProfit}</TableCell>
                          <TableCell>{row.operatingExpenses}</TableCell>
                          <TableCell>{row.operatingIncome}</TableCell>
                          <TableCell>{row.netIncome}</TableCell>
                          <TableCell>{row.eps}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="balance" className="space-y-4">
          {view === "chart" ? (
            <Card>
              <CardHeader>
                <CardTitle>Assets & Liabilities</CardTitle>
                <CardDescription>Balance sheet composition</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={balance.slice().reverse().map((statement) => ({
                        date: statement.date?.split('-')[0] || statement.calendarYear,
                        "Total Assets": statement.totalAssets,
                        "Total Liabilities": statement.totalLiabilities,
                        "Total Equity": statement.totalStockholdersEquity
                      }))}
                      margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => formatLargeNumber(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="Total Assets" fill="#3B82F6" />
                      <Bar dataKey="Total Liabilities" fill="#EF4444" />
                      <Bar dataKey="Total Equity" fill="#10B981" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Total Assets</TableHead>
                      <TableHead>Total Liabilities</TableHead>
                      <TableHead>Total Equity</TableHead>
                      <TableHead>Cash & Equivalents</TableHead>
                      <TableHead>Long Term Debt</TableHead>
                      <TableHead>Current Assets</TableHead>
                      <TableHead>Current Liabilities</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {balance.map((statement) => {
                      const row = formatBalanceRow(statement);
                      return (
                        <TableRow key={statement.date}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.totalAssets}</TableCell>
                          <TableCell>{row.totalLiabilities}</TableCell>
                          <TableCell>{row.totalEquity}</TableCell>
                          <TableCell>{row.cashAndEquivalents}</TableCell>
                          <TableCell>{row.longTermDebt}</TableCell>
                          <TableCell>{row.totalCurrentAssets}</TableCell>
                          <TableCell>{row.totalCurrentLiabilities}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="cashflow" className="space-y-4">
          {view === "chart" ? (
            <Card>
              <CardHeader>
                <CardTitle>Cash Flow Analysis</CardTitle>
                <CardDescription>Operating, investing and free cash flow</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                      data={cashflow.slice().reverse().map((statement) => ({
                        date: statement.date?.split('-')[0] || statement.calendarYear,
                        "Operating Cash Flow": statement.operatingCashFlow,
                        "Free Cash Flow": statement.freeCashFlow,
                        "Capital Expenditure": Math.abs(statement.capitalExpenditure) * -1 // Make negative for visualization
                      }))}
                      margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => formatLargeNumber(value)}
                      />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      <Area 
                        type="monotone" 
                        dataKey="Operating Cash Flow" 
                        stroke="#3B82F6" 
                        fill="#3B82F6" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Free Cash Flow" 
                        stroke="#10B981" 
                        fill="#10B981" 
                        fillOpacity={0.3}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="Capital Expenditure" 
                        stroke="#EF4444" 
                        fill="#EF4444"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>Operating Cash Flow</TableHead>
                      <TableHead>Capital Expenditure</TableHead>
                      <TableHead>Free Cash Flow</TableHead>
                      <TableHead>Dividends Paid</TableHead>
                      <TableHead>Net Change in Cash</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cashflow.map((statement) => {
                      const row = formatCashFlowRow(statement);
                      return (
                        <TableRow key={statement.date}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.operatingCashFlow}</TableCell>
                          <TableCell>{row.capitalExpenditure}</TableCell>
                          <TableCell>{row.freeCashFlow}</TableCell>
                          <TableCell>{row.dividendsPaid}</TableCell>
                          <TableCell>{row.netChangeInCash}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
        
        <TabsContent value="ratios" className="space-y-4">
          {view === "chart" ? (
            <Card>
              <CardHeader>
                <CardTitle>Key Financial Ratios</CardTitle>
                <CardDescription>Profitability and efficiency metrics</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={ratios.slice().reverse().map((ratio) => ({
                        date: ratio.date?.split('-')[0] || ratio.date,
                        "Return on Equity": ratio.returnOnEquity * 100,
                        "Return on Assets": ratio.returnOnAssets * 100,
                        "Net Profit Margin": ratio.netProfitMargin * 100,
                        "Gross Profit Margin": ratio.grossProfitMargin * 100
                      }))}
                      margin={{ top: 10, right: 30, left: 30, bottom: 0 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis 
                        tickFormatter={(value) => `${value.toFixed(1)}%`}
                      />
                      <Tooltip 
                        formatter={(value) => `${Number(value).toFixed(2)}%`}
                        labelFormatter={(label) => `Year: ${label}`}
                      />
                      <Legend />
                      <Bar dataKey="Return on Equity" fill="#3B82F6" />
                      <Bar dataKey="Return on Assets" fill="#6366F1" />
                      <Bar dataKey="Net Profit Margin" fill="#10B981" />
                      <Bar dataKey="Gross Profit Margin" fill="#8B5CF6" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Year</TableHead>
                      <TableHead>P/E Ratio</TableHead>
                      <TableHead>ROE</TableHead>
                      <TableHead>ROA</TableHead>
                      <TableHead>Current Ratio</TableHead>
                      <TableHead>Debt to Equity</TableHead>
                      <TableHead>Gross Margin</TableHead>
                      <TableHead>Net Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ratios.map((ratio) => {
                      const row = formatRatioRow(ratio);
                      return (
                        <TableRow key={ratio.date}>
                          <TableCell>{row.date}</TableCell>
                          <TableCell>{row.pe}</TableCell>
                          <TableCell>{row.roe}</TableCell>
                          <TableCell>{row.roa}</TableCell>
                          <TableCell>{row.currentRatio}</TableCell>
                          <TableCell>{row.debtToEquity}</TableCell>
                          <TableCell>{row.grossMargin}</TableCell>
                          <TableCell>{row.netMargin}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FinancialData;
