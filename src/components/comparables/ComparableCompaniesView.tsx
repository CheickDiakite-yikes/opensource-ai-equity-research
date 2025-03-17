
import React from "react";
import { useComparableCompanies } from "@/hooks/useComparableCompanies";
import LoadingSkeleton from "@/components/LoadingSkeleton";
import ErrorState from "@/components/analysis/ErrorState";
import ComparableCompaniesTable from "./ComparableCompaniesTable";
import ComparableCompaniesHeader from "./ComparableCompaniesHeader";

interface ComparableCompaniesViewProps {
  symbol: string;
}

const ComparableCompaniesView: React.FC<ComparableCompaniesViewProps> = ({ symbol }) => {
  const { isLoading, error, data } = useComparableCompanies(symbol);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-semibold">Comparable Companies Analysis</h2>
        <p className="text-muted-foreground">Loading comparable companies data...</p>
        <LoadingSkeleton />
      </div>
    );
  }

  if (error || !data) {
    return (
      <ErrorState 
        symbol={symbol} 
        onRetry={() => window.location.reload()} 
        isRetrying={false}
        message={error || `Could not generate comparable companies analysis for ${symbol}`}
      />
    );
  }

  return (
    <div className="space-y-6">
      <ComparableCompaniesHeader symbol={symbol} />
      <ComparableCompaniesTable data={data} />
    </div>
  );
};

export default ComparableCompaniesView;
