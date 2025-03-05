
import React from "react";
import { useTTMData } from "@/hooks/useTTMData";
import TTMLoadingState from "./ttm/TTMLoadingState";
import TTMErrorState from "./ttm/TTMErrorState";
import TTMDataDisplay from "./ttm/TTMDataDisplay";

interface TTMCardProps {
  symbol: string;
  className?: string;
}

const TTMCard: React.FC<TTMCardProps> = ({ symbol, className }) => {
  const { ttmData, isLoading, error } = useTTMData(symbol);

  if (isLoading) {
    return <TTMLoadingState className={className} />;
  }

  if (error || !ttmData) {
    return <TTMErrorState error={error} className={className} />;
  }

  return <TTMDataDisplay data={ttmData} className={className} />;
};

export default TTMCard;
