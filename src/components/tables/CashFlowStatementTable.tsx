
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CashFlowStatement } from "@/types/financialStatementTypes";
import { formatCurrency } from "@/utils/financialDataUtils";

interface CashFlowStatementTableProps {
  cashFlowStatements: CashFlowStatement[];
}

const CashFlowStatementTable: React.FC<CashFlowStatementTableProps> = ({ cashFlowStatements }) => {
  // Sort statements by date (newest first)
  const sortedStatements = [...cashFlowStatements].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-medium">Cash Flow Statement</CardTitle>
        <p className="text-sm text-muted-foreground">All figures in millions (USD)</p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-medium">Item</TableHead>
                {sortedStatements.map((statement) => (
                  <TableHead key={statement.date} className="text-right font-medium">
                    {new Date(statement.date).getFullYear()}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell className="font-medium">Net Income</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right">
                    {formatCurrency(statement.netIncome / 1000000)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Depreciation & Amortization</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right">
                    {formatCurrency(statement.depreciationAndAmortization / 1000000)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Change in Working Capital</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right">
                    {formatCurrency(statement.changeInWorkingCapital / 1000000)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Cash from Operations</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right font-medium">
                    {formatCurrency(statement.netCashProvidedByOperatingActivities / 1000000)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Capital Expenditures</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right">
                    {formatCurrency(statement.capitalExpenditure / 1000000)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow className="bg-muted/50">
                <TableCell className="font-medium">Free Cash Flow</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right font-medium">
                    {formatCurrency(statement.freeCashFlow / 1000000)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Dividend Paid</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right">
                    {formatCurrency(statement.dividendsPaid ? statement.dividendsPaid / 1000000 : 0)}
                  </TableCell>
                ))}
              </TableRow>
              <TableRow>
                <TableCell className="font-medium">Share Repurchases</TableCell>
                {sortedStatements.map((statement) => (
                  <TableCell key={statement.date} className="text-right">
                    {formatCurrency(statement.commonStockRepurchased ? statement.commonStockRepurchased / 1000000 : 0)}
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

export default CashFlowStatementTable;
