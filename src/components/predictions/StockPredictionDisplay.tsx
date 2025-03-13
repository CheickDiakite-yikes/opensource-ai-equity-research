
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
            <div>
              <span className="font-medium">Predicted Price (12 months):</span> ${prediction.predictedPrice?.toFixed(2) || 'N/A'}
            </div>
            <div>
              <span className="font-medium">Potential Return:</span> 
              <span className={prediction.potentialReturn > 0 ? 'text-green-600' : 'text-red-600'}>
                {prediction.potentialReturn ? `${prediction.potentialReturn.toFixed(2)}%` : 'N/A'}
              </span>
            </div>
            {prediction.confidence && (
              <div>
                <span className="font-medium">Confidence Level:</span> {prediction.confidence}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {prediction.rationale && (
        <Card>
          <CardHeader>
            <CardTitle>Analysis Rationale</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-line">{prediction.rationale}</p>
          </CardContent>
        </Card>
      )}

      {prediction.riskFactors && prediction.riskFactors.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Risk Factors</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="list-disc pl-5 space-y-1">
              {prediction.riskFactors.map((risk, index) => (
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
