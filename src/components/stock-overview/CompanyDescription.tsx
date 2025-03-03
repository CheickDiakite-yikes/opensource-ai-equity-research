
import { Card, CardContent } from "@/components/ui/card";

interface CompanyDescriptionProps {
  description: string;
}

const CompanyDescription = ({ description }: CompanyDescriptionProps) => {
  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-sm font-medium mb-2">Company Description</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description || "No description available."}
        </p>
      </CardContent>
    </Card>
  );
};

export default CompanyDescription;
