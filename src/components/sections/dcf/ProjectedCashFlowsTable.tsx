
import React from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Loader2 } from "lucide-react";

interface Projection {
  year: string;
  revenue: number;
  ebit: number;
  fcf: number;
}

interface ProjectedCashFlowsTableProps {
  projections: Projection[];
  isLoading?: boolean;
}

const ProjectedCashFlowsTable: React.FC<ProjectedCashFlowsTableProps> = ({ 
  projections,
  isLoading = false
}) => {
  // Sort projections by year in ascending order
  const sortedProjections = [...projections].sort((a, b) => {
    return parseInt(a.year) - parseInt(b.year);
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projected Cash Flows</CardTitle>
        <CardDescription className="text-xs text-muted-foreground">All figures in millions (USD)</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center items-center h-40">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left font-medium py-2">Period</th>
                  <th className="text-right font-medium py-2">Revenue</th>
                  <th className="text-right font-medium py-2">EBIT</th>
                  <th className="text-right font-medium py-2">Free Cash Flow</th>
                </tr>
              </thead>
              <tbody>
                {sortedProjections.map((proj, i) => (
                  <tr key={i} className="border-b last:border-0">
                    <td className="py-2">{proj.year}</td>
                    <td className="text-right py-2">${(proj.revenue / 1000000).toFixed(2)}</td>
                    <td className="text-right py-2">${(proj.ebit / 1000000).toFixed(2)}</td>
                    <td className="text-right py-2">${(proj.fcf / 1000000).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProjectedCashFlowsTable;
