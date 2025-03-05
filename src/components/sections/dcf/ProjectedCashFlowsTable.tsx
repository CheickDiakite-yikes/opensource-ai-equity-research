
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatCurrency, formatNumber } from "@/utils/financial/formatUtils";
import { YearlyDCFData } from "@/types/ai-analysis/dcfTypes";

export interface ProjectedCashFlowsTableProps {
  projections: YearlyDCFData[];
}

const ProjectedCashFlowsTable: React.FC<ProjectedCashFlowsTableProps> = ({ projections }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Projected Cash Flows</h3>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Year</TableHead>
              <TableHead>Revenue</TableHead>
              <TableHead>EBIT</TableHead>
              <TableHead>EBITDA</TableHead>
              <TableHead>Free Cash Flow</TableHead>
              <TableHead>Operating Cash Flow</TableHead>
              <TableHead>Capital Expenditure</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projections.map((item, index) => (
              <TableRow key={`projection-${index}`} className={index === 0 ? 'bg-muted/50' : ''}>
                <TableCell className="font-medium">{item.year}</TableCell>
                <TableCell>{formatCurrency(item.revenue)}</TableCell>
                <TableCell>{formatCurrency(item.ebit)}</TableCell>
                <TableCell>{formatCurrency(item.ebitda)}</TableCell>
                <TableCell>{formatCurrency(item.freeCashFlow)}</TableCell>
                <TableCell>{formatCurrency(item.operatingCashFlow)}</TableCell>
                <TableCell>{formatCurrency(Math.abs(item.capitalExpenditure))}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <p className="text-xs text-gray-500">
        Note: Projections are based on the DCF model assumptions and historical financial data.
      </p>
    </div>
  );
};

export default ProjectedCashFlowsTable;
