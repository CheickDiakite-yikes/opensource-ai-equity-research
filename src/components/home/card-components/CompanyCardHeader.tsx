
import React from "react";
import { ExternalLink } from "lucide-react";
import { motion } from "framer-motion";

interface CompanyCardHeaderProps {
  symbol: string;
  name: string;
}

const CompanyCardHeader = ({ symbol, name }: CompanyCardHeaderProps) => {
  return (
    <div>
      <div className="flex justify-between items-center mb-2">
        <span className="font-bold text-2xl text-slate-800 dark:text-slate-100">
          {symbol}
        </span>
        <motion.div
          whileHover={{ rotate: 15, scale: 1.1 }}
          className="p-1.5 rounded-full bg-slate-100 dark:bg-slate-700"
        >
          <ExternalLink className="h-4 w-4 text-slate-500 dark:text-slate-300" />
        </motion.div>
      </div>
      <div className="text-sm text-slate-500 dark:text-slate-400 mb-4 truncate font-medium">
        {name}
      </div>
    </div>
  );
};

export default CompanyCardHeader;
