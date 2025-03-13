
import React from "react";
import { Card } from "@/components/ui/card";

interface CompanyOverviewProps {
  companyDescription: string;
  businessModel: string;
  productsServices: string;
  industryOverview: string;
  competitiveLandscape: string;
}

const CompanyOverview: React.FC<CompanyOverviewProps> = ({
  companyDescription,
  businessModel,
  productsServices,
  industryOverview,
  competitiveLandscape
}) => {
  return (
    <div className="space-y-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Company Description</h3>
        <p className="text-sm text-muted-foreground">{companyDescription}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Business Model</h3>
        <p className="text-sm text-muted-foreground">{businessModel}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Products & Services</h3>
        <p className="text-sm text-muted-foreground">{productsServices}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Industry Overview</h3>
        <p className="text-sm text-muted-foreground">{industryOverview}</p>
      </Card>
      
      <Card className="p-4">
        <h3 className="text-lg font-semibold mb-2">Competitive Landscape</h3>
        <p className="text-sm text-muted-foreground">{competitiveLandscape}</p>
      </Card>
    </div>
  );
};

export default CompanyOverview;
