
import React from "react";
import { StockPrediction } from "@/types/aiAnalysisTypes";
import { Check, Info, AlertTriangle } from "lucide-react";

interface PricePredictionDisplayProps {
  prediction: StockPrediction;
}

const PricePredictionDisplay: React.FC<PricePredictionDisplayProps> = ({ prediction }) => {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold">{prediction.symbol} - Price Prediction</h2>
          <p className="text-sm text-muted-foreground">Current Price: {prediction.currentPrice.toFixed(2)}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 border rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">1 Month</span>
          <span className={`text-lg font-semibold ${prediction.predictedPrice.oneMonth > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
            ${prediction.predictedPrice.oneMonth.toFixed(2)}
          </span>
        </div>
        <div className="p-3 border rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">3 Months</span>
          <span className={`text-lg font-semibold ${prediction.predictedPrice.threeMonths > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
            ${prediction.predictedPrice.threeMonths.toFixed(2)}
          </span>
        </div>
        <div className="p-3 border rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">6 Months</span>
          <span className={`text-lg font-semibold ${prediction.predictedPrice.sixMonths > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
            ${prediction.predictedPrice.sixMonths.toFixed(2)}
          </span>
        </div>
        <div className="p-3 border rounded-lg">
          <span className="text-xs text-muted-foreground block mb-1">1 Year</span>
          <span className={`text-lg font-semibold ${prediction.predictedPrice.oneYear > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
            ${prediction.predictedPrice.oneYear.toFixed(2)}
          </span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2 flex items-center">
            <Info className="h-4 w-4 mr-1.5" />
            Sentiment Analysis
          </h3>
          <p className="text-sm text-muted-foreground">{prediction.sentimentAnalysis}</p>
          <div className="mt-3">
            <span className="text-xs text-muted-foreground">Confidence Level</span>
            <div className="mt-1 h-2 w-full bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-primary" 
                style={{ width: `${prediction.confidence}%` }}
              ></div>
            </div>
            <span className="text-xs mt-1 block">{prediction.confidence}%</span>
          </div>
        </div>
        
        <div className="border rounded-lg p-4">
          <h3 className="text-sm font-medium mb-2">Key Drivers</h3>
          <ul className="space-y-1">
            {prediction.keyDrivers.map((driver, index) => (
              <li key={index} className="text-sm flex items-start">
                <Check className="h-4 w-4 mr-1.5 text-green-600 mt-0.5 flex-shrink-0" />
                <span>{driver}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="border rounded-lg p-4">
        <h3 className="text-sm font-medium mb-2">Potential Risks</h3>
        <ul className="space-y-2">
          {prediction.risks.map((risk, index) => (
            <li key={index} className="text-sm flex items-start">
              <AlertTriangle className="h-4 w-4 mr-1.5 text-amber-600 mt-0.5 flex-shrink-0" />
              <span>{risk}</span>
            </li>
          ))}
        </ul>
      </div>
      
      <div className="bg-amber-50 border-amber-200 border rounded-lg p-3 text-xs text-amber-800">
        <div className="flex items-start">
          <AlertTriangle className="h-4 w-4 mr-2 flex-shrink-0 mt-0.5" />
          <p>
            These predictions are generated using AI and historical data. Markets are unpredictable and
            future performance may vary significantly. This should not be the sole basis for investment decisions.
          </p>
        </div>
      </div>
    </div>
  );
};

export default PricePredictionDisplay;
