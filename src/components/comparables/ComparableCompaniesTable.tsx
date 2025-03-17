
import React from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { ComparablesResponse } from "@/types/comparables";
import { formatNumber, formatCurrency, formatRatio } from "./formatUtils";

interface ComparableCompaniesTableProps {
  data: ComparablesResponse;
}

const ComparableCompaniesTable: React.FC<ComparableCompaniesTableProps> = ({ data }) => {
  const { mainCompany, comparables, averages, medians } = data;
  const allCompanies = [mainCompany, ...comparables];

  return (
    <div className="rounded-md border overflow-hidden">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader className="bg-muted/50">
            <TableRow>
              <TableHead className="font-medium w-[180px] sticky left-0 bg-muted/50">Company Name</TableHead>
              
              <TableHead colSpan={3} className="text-center border-l bg-muted/70">Market Data</TableHead>
              <TableHead colSpan={4} className="text-center border-l bg-muted/70">Financial Data</TableHead>
              <TableHead colSpan={4} className="text-center border-l bg-muted/70">Valuation</TableHead>
            </TableRow>
            <TableRow>
              <TableHead className="font-medium sticky left-0 bg-muted/50">Symbol</TableHead>
              
              {/* Market Data */}
              <TableHead className="border-l">Price</TableHead>
              <TableHead>Market Cap</TableHead>
              <TableHead>TEV</TableHead>
              
              {/* Financial Data */}
              <TableHead className="border-l">Sales</TableHead>
              <TableHead>EBITDA</TableHead>
              <TableHead>EBIT</TableHead>
              <TableHead>Earnings</TableHead>
              
              {/* Valuation */}
              <TableHead className="border-l">EV/Sales</TableHead>
              <TableHead>EV/EBITDA</TableHead>
              <TableHead>EV/EBIT</TableHead>
              <TableHead>P/E</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {allCompanies.map((company, index) => (
              <TableRow 
                key={company.symbol}
                className={index === 0 ? "bg-primary/5 font-medium" : undefined}
              >
                <TableCell className="font-medium sticky left-0 bg-background">
                  <div>{company.name}</div>
                  <div className="text-xs text-muted-foreground">{company.symbol}</div>
                </TableCell>
                
                {/* Market Data */}
                <TableCell className="border-l">{formatCurrency(company.price)}</TableCell>
                <TableCell>{formatNumber(company.marketCap)}</TableCell>
                <TableCell>{formatNumber(company.enterpriseValue)}</TableCell>
                
                {/* Financial Data */}
                <TableCell className="border-l">{formatNumber(company.revenue)}</TableCell>
                <TableCell>{formatNumber(company.ebitda)}</TableCell>
                <TableCell>{formatNumber(company.ebit)}</TableCell>
                <TableCell>{formatNumber(company.netIncome)}</TableCell>
                
                {/* Valuation */}
                <TableCell className="border-l">{formatRatio(company.evToSales)}</TableCell>
                <TableCell>{formatRatio(company.evToEbitda)}</TableCell>
                <TableCell>{formatRatio(company.evToEbit)}</TableCell>
                <TableCell>{formatRatio(company.peRatio)}</TableCell>
              </TableRow>
            ))}
            
            {/* Average row */}
            <TableRow className="bg-muted/20 font-medium">
              <TableCell className="sticky left-0 bg-muted/20" colSpan={9}>Average</TableCell>
              <TableCell>{formatRatio(averages.evToSales)}</TableCell>
              <TableCell>{formatRatio(averages.evToEbitda)}</TableCell>
              <TableCell>{formatRatio(averages.evToEbit)}</TableCell>
              <TableCell>{formatRatio(averages.peRatio)}</TableCell>
            </TableRow>
            
            {/* Median row */}
            <TableRow className="bg-muted/20 font-medium">
              <TableCell className="sticky left-0 bg-muted/20" colSpan={9}>Median</TableCell>
              <TableCell>{formatRatio(medians.evToSales)}</TableCell>
              <TableCell>{formatRatio(medians.evToEbitda)}</TableCell>
              <TableCell>{formatRatio(medians.evToEbit)}</TableCell>
              <TableCell>{formatRatio(medians.peRatio)}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default ComparableCompaniesTable;
