
import { Card } from "@/components/ui/card";

interface ErrorDisplayProps {
  errorMessage: string | null;
}

const ErrorDisplay = ({ errorMessage }: ErrorDisplayProps) => {
  return (
    <Card className="p-6">
      <div className="text-center py-8">
        <h3 className="text-lg font-medium text-red-600 mb-2">Error Loading Data</h3>
        <p className="text-muted-foreground">{errorMessage || "Unable to load data for this symbol"}</p>
      </div>
    </Card>
  );
};

export default ErrorDisplay;
