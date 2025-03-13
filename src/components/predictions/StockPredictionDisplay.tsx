
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StockPrediction } from '@/types/ai-analysis/predictionTypes';

interface StockPredictionDisplayProps {
  prediction: StockPrediction;
}

const StockPredictionDisplay: React.FC<StockPredictionDisplayProps> = ({ prediction }) => {
  if (!prediction) {
    return <div>No prediction data available</div>;
  }

  // Calculate one year percentage change
  const oneYearReturn = prediction.predictedPrice?.oneYear 
    ? ((prediction.predictedPrice.oneYear - prediction.currentPrice) / prediction.currentPrice) * 100
    : null;

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Price Prediction</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div>
              <span className="font-medium">Current Price:</span> ${prediction.currentPrice?.toFixed(2) || 'N/A'}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-4">
              <div className="p-3 border rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">1 Month</span>
                <span className={`text-lg font-semibold ${prediction.predictedPrice?.oneMonth > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                  ${prediction.predictedPrice?.oneMonth?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="p-3 border rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">3 Months</span>
                <span className={`text-lg font-semibold ${prediction.predictedPrice?.threeMonths > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                  ${prediction.predictedPrice?.threeMonths?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="p-3 border rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">6 Months</span>
                <span className={`text-lg font-semibold ${prediction.predictedPrice?.sixMonths > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                  ${prediction.predictedPrice?.sixMonths?.toFixed(2) || 'N/A'}
                </span>
              </div>
              <div className="p-3 border rounded-lg">
                <span className="text-xs text-muted-foreground block mb-1">1 Year</span>
                <span className={`text-lg font-semibold ${prediction.predictedPrice?.oneYear > prediction.currentPrice ? 'text-green-600' : 'text-red-600'}`}>
                  ${prediction.predictedPrice?.oneYear?.toFixed(2) || 'N/A'}
                </span>
              </div>
            </div>
            {oneYearReturn !== null && (
              <div>
                <span className="font-medium">Potential Return (1 Year):</span> 
                <span className={oneYearReturn > 0 ? 'text-green-600 ml-1' : 'text-red-600 ml-1'}>
                  {oneYearReturn.toFixed(2)}%
                </span>
              </div>
            )}
            {prediction.confidenceLevel && (
              <div>
                <span className="font-medium">Confidence Level:</span> {prediction.confidenceLevel}%
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {prediction.sentimentAnalysis && (
        <Card>
          <CardHeader>
            <CardTitle>Sentiment Analysis</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{prediction.sentimentAnalysis}</p>
          </CardContent>
        </Card>
      )}

      {prediction.keyDrivers && prediction.keyDrivers.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Key Drivers</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {prediction.keyDrivers.map((driver, index) => (
                <li key={index}>{driver}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {prediction.risks && prediction.risks.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {prediction.risks.map((risk, index) => (
                <li key={index}>{risk}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default StockPredictionDisplay;
