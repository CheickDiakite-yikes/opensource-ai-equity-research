
import React from 'react';
import { AcquisitionOwnershipResponse, AcquisitionOwnershipItem } from '@/types/alternative/ownershipTypes';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ExternalLink } from 'lucide-react';
import ErrorDisplay from '../reports/ErrorDisplay';
import { motion } from 'framer-motion';

interface AcquisitionOwnershipSectionProps {
  data: AcquisitionOwnershipResponse | null;
  isLoading: boolean;
  error: string | null;
  onRetry?: () => void;
}

const AcquisitionOwnershipSection: React.FC<AcquisitionOwnershipSectionProps> = ({
  data,
  isLoading,
  error,
  onRetry
}) => {
  if (error) {
    return (
      <ErrorDisplay 
        error={error} 
        title="Acquisition Ownership Data Unavailable"
        onRetry={onRetry}
      />
    );
  }

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!data || !data.ownershipData || data.ownershipData.length === 0) {
    return (
      <div className="text-center py-10">
        <h3 className="text-lg font-medium mb-2">No Acquisition Ownership Data Available</h3>
        <p className="text-muted-foreground">
          There is no acquisition ownership data available for this company at this time.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h3 className="text-lg font-medium">Acquisition Ownership</h3>
        <p className="text-muted-foreground">
          Beneficial ownership changes from SEC Form 13D/G filings, showing significant ownership positions and changes.
        </p>
      </div>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Reporting Person</TableHead>
              <TableHead>Filing Date</TableHead>
              <TableHead>Ownership %</TableHead>
              <TableHead>Shares Owned</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>SEC Filing</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.ownershipData.map((item, index) => (
              <motion.tr
                key={`${item.cik}-${item.filingDate}-${index}`}
                className="hover:bg-muted/50"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <TableCell className="font-medium">{item.nameOfReportingPerson}</TableCell>
                <TableCell>
                  {item.filingDate ? format(new Date(item.filingDate), 'MMM dd, yyyy') : 'N/A'}
                </TableCell>
                <TableCell>{item.percentOfClass || 'N/A'}</TableCell>
                <TableCell>{formatLargeNumber(item.amountBeneficiallyOwned)}</TableCell>
                <TableCell>
                  <Badge variant="outline">{item.typeOfReportingPerson || 'Unknown'}</Badge>
                </TableCell>
                <TableCell>
                  {item.url ? (
                    <a 
                      href={item.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-blue-500 hover:text-blue-700"
                    >
                      <ExternalLink size={14} />
                      <span>View</span>
                    </a>
                  ) : (
                    'N/A'
                  )}
                </TableCell>
              </motion.tr>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="text-xs text-muted-foreground italic">
        Source: SEC Form 13D/G filings via Financial Modeling Prep
      </div>
    </div>
  );
};

const formatLargeNumber = (value: string | number | undefined): string => {
  if (value === undefined || value === null) return 'N/A';
  
  const numValue = typeof value === 'string' ? parseFloat(value) : value;
  
  if (isNaN(numValue)) return 'N/A';
  
  if (numValue >= 1000000) {
    return (numValue / 1000000).toFixed(2) + 'M';
  } else if (numValue >= 1000) {
    return (numValue / 1000).toFixed(2) + 'K';
  } else {
    return numValue.toString();
  }
};

const LoadingSkeleton = () => (
  <div className="space-y-6">
    <div className="space-y-2">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-4 w-full" />
    </div>

    <div className="space-y-3">
      <div className="grid grid-cols-6 gap-4">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>

      {[1, 2, 3, 4, 5].map((i) => (
        <div key={i} className="grid grid-cols-6 gap-4">
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
          <Skeleton className="h-6 w-full" />
        </div>
      ))}
    </div>
  </div>
);

export default AcquisitionOwnershipSection;
