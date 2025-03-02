
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { KeyRatio } from "@/types/financialStatementTypes";

interface KeyRatiosTableProps {
  keyRatios: KeyRatio[];
}

const KeyRatiosTable: React.FC<KeyRatiosTableProps> = ({ keyRatios }) => {
  // Sort ratios by date (newest first)
  const sortedRatios = [...keyRatios].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Format percentages to 2 decimal places
  const formatPercentage = (value: number): string => {
    return (value * 100).toFixed(2) + '%';
  };

  // Format decimal to 2 decimal places
  const formatDecimal = (value: number): string => {
    return value.toFixed(2);
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Key Financial Ratios</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Ratio</TableHead>
                {sortedRatios.map((ratio) => (
                  <TableHead key={ratio.date} className="text-right font-medium">
                    {new Date(ratio.date).getFullYear()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={sortedRatios.length + 1} className="font-medium">
                  Profitability
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Return on Equity (ROE)</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatPercentage(ratio.returnOnEquity)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Return on Assets (ROA)</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatPercentage(ratio.returnOnAssets)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Net Profit Margin</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatPercentage(ratio.netProfitMargin)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Gross Profit Margin</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatPercentage(ratio.grossProfitMargin)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={sortedRatios.length + 1} className="font-medium">
                  Liquidity
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Current Ratio</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatDecimal(ratio.currentRatio)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Quick Ratio</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatDecimal(ratio.quickRatio)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell colSpan={sortedRatios.length + 1} className="font-medium">
                  Debt
                </TableCell>
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Debt to Equity</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatDecimal(ratio.debtEquityRatio)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Interest Coverage</TableCell>
                {sortedRatios.map((ratio) => (
                  <TableCell key={ratio.date} className="text-right">
                    {formatDecimal(ratio.interestCoverage)}
                  </TableCell>
                ))}
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default KeyRatiosTable;
