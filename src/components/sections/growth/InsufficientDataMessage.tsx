
import React from 'react';

export const InsufficientDataMessage: React.FC = () => {
  return (
    <div className="p-4 text-center">
      <h3 className="text-lg font-medium mb-2">Insufficient Data</h3>
      <p className="text-muted-foreground">
        At least 2 years of financial data are required to calculate growth rates.
      </p>
    </div>
  );
};
