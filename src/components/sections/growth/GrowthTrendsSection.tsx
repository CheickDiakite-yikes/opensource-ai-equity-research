
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card";
import GrowthChart from '../../charts/GrowthChart';

interface GrowthTrendsSectionProps {
  data: Array<{ year: string; growth: number }>;
}

export const GrowthTrendsSection: React.FC<GrowthTrendsSectionProps> = ({ data }) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Growth Trends</CardTitle>
      </CardHeader>
      <CardContent>
        <GrowthChart data={data} title="Revenue Growth" color="#10b981" />
      </CardContent>
    </Card>
  );
};
