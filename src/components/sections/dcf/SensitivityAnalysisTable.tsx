
import React from "react";
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from "@/components/ui/table";
import { formatCurrency } from "@/utils/financial/formatUtils";
import { DCFSensitivityData } from "@/types/ai-analysis/dcfTypes";

export interface SensitivityAnalysisTableProps {
  sensitivityData: DCFSensitivityData;
  currentPrice: number;
}

const SensitivityAnalysisTable: React.FC<SensitivityAnalysisTableProps> = ({ 
  sensitivityData,
  currentPrice
}) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Sensitivity Analysis</h3>
      <p className="text-sm text-gray-500 mb-4">
        The table below shows estimated stock prices at different combinations of growth rates and discount rates.
      </p>
      
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Growth↓ Discount→</TableHead>
              {sensitivityData.headers.slice(1).map((header, index) => (
                <TableHead key={`head-${index}`} className="text-center">
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sensitivityData.rows.map((row, rowIndex) => (
              <TableRow key={`row-${rowIndex}`}>
                <TableCell className="font-medium">{row.growth}</TableCell>
                {row.values.map((value, colIndex) => {
                  const isHighlighted = 
                    Math.abs(value - currentPrice) < currentPrice * 0.1;
                    
                  const cellColor = isHighlighted 
                    ? 'bg-blue-50 font-semibold' 
                    : value > currentPrice 
                      ? 'bg-green-50' 
                      : 'bg-red-50';
                      
                  return (
                    <TableCell 
                      key={`cell-${rowIndex}-${colIndex}`} 
                      className={`text-center ${cellColor}`}
                    >
                      {formatCurrency(value)}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex space-x-4 text-xs">
        <div className="flex items-center">
          <div className="w-3 h-3 bg-green-50 mr-1 border border-green-200"></div>
          <span>Upside Potential</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-red-50 mr-1 border border-red-200"></div>
          <span>Downside Risk</span>
        </div>
        <div className="flex items-center">
          <div className="w-3 h-3 bg-blue-50 mr-1 border border-blue-200"></div>
          <span>Near Current Price</span>
        </div>
      </div>
    </div>
  );
};

export default SensitivityAnalysisTable;
