
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import RatioCard from "@/components/cards/RatioCard";
import TTMCard from "@/components/cards/TTMCard";
import ProfitabilityChart from "@/components/charts/ProfitabilityChart";
import { fetchKeyRatiosTTM } from "@/services/api";
import { toast } from "@/components/ui/use-toast";

interface RatiosTabContentProps {
  ratioData: any[];
  symbol?: string;
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

// TTM display component to show TTM ratios
const TTMRatioDisplay = ({ ttmData, isLoading }: { ttmData: any, isLoading: boolean }) => {
  if (isLoading) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">TTM Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-32 flex items-center justify-center">
            <p className="text-sm text-gray-500">Loading TTM data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!ttmData) {
    return (
      <Card className="h-full">
        <CardHeader>
          <CardTitle className="text-lg">TTM Data</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="w-full h-32 flex items-center justify-center">
            <p className="text-sm text-gray-500">No TTM data available</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-lg">TTM (Latest 12 Months)</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-sm">
            <div className="font-medium text-gray-500">P/E Ratio</div>
            <div className="text-lg font-bold">{ttmData.priceToEarningsRatioTTM?.toFixed(2) || 'N/A'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-500">P/B Ratio</div>
            <div className="text-lg font-bold">{ttmData.priceToBookRatioTTM?.toFixed(2) || 'N/A'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-500">ROE</div>
            <div className="text-lg font-bold">{ttmData.returnOnEquityTTM ? (ttmData.returnOnEquityTTM * 100).toFixed(2) + '%' : 'N/A'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-500">ROA</div>
            <div className="text-lg font-bold">{ttmData.returnOnAssetsTTM ? (ttmData.returnOnAssetsTTM * 100).toFixed(2) + '%' : 'N/A'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-500">Debt/Equity</div>
            <div className="text-lg font-bold">{ttmData.debtToEquityRatioTTM?.toFixed(2) || 'N/A'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-500">Gross Margin</div>
            <div className="text-lg font-bold">{ttmData.grossProfitMarginTTM ? (ttmData.grossProfitMarginTTM * 100).toFixed(2) + '%' : 'N/A'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-500">Net Margin</div>
            <div className="text-lg font-bold">{ttmData.netProfitMarginTTM ? (ttmData.netProfitMarginTTM * 100).toFixed(2) + '%' : 'N/A'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium text-gray-500">Current Ratio</div>
            <div className="text-lg font-bold">{ttmData.currentRatioTTM?.toFixed(2) || 'N/A'}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const RatiosTabContent: React.FC<RatiosTabContentProps> = ({ ratioData, symbol = "" }) => {
  const [ttmData, setTtmData] = useState<any>(null);
  const [isLoadingTTM, setIsLoadingTTM] = useState<boolean>(false);

  useEffect(() => {
    // Fetch TTM data when component mounts and symbol changes
    const fetchTTMData = async () => {
      if (!symbol) return;
      
      try {
        setIsLoadingTTM(true);
        const ttmRatios = await fetchKeyRatiosTTM(symbol);
        setTtmData(ttmRatios);
        console.log("TTM Data fetched:", ttmRatios);
      } catch (error) {
        console.error("Error fetching TTM data:", error);
        toast({
          title: "TTM Data Error",
          description: "Failed to fetch TTM financial data. Using historical data only.",
          variant: "destructive",
        });
      } finally {
        setIsLoadingTTM(false);
      }
    };

    fetchTTMData();
  }, [symbol]);

  return (
    <motion.div 
      variants={container}
      initial="hidden"
      animate="show"
      className="mt-4 space-y-8"
    >
      <motion.div 
        variants={container} 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
      >
        {ratioData.slice(0, 3).map((ratio, index) => (
          <motion.div key={index} variants={item}>
            <RatioCard data={ratio} />
          </motion.div>
        ))}
        <motion.div variants={item}>
          {symbol ? (
            <TTMRatioDisplay ttmData={ttmData} isLoading={isLoadingTTM} />
          ) : (
            <TTMCard symbol={symbol} />
          )}
        </motion.div>
      </motion.div>
      
      <motion.div variants={item} transition={{ delay: 0.3 }}>
        <ProfitabilityChart data={ratioData} />
      </motion.div>
    </motion.div>
  );
};

export default RatiosTabContent;
