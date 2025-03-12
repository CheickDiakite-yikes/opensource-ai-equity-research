
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { FileIcon, LineChartIcon, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

const SavedContentLoader = () => (
  <motion.div 
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="container max-w-6xl mx-auto px-4 py-8 space-y-8"
  >
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-primary">Saved Content</h1>
        <p className="text-muted-foreground mt-1">Your research reports and price predictions</p>
      </div>
      <div className="flex items-center gap-3">
        <Button variant="outline" size="sm" disabled className="gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </Button>
        <div className="text-sm text-muted-foreground">
          <Skeleton className="h-4 w-[150px]" />
        </div>
      </div>
    </div>
    
    <Tabs defaultValue="reports">
      <TabsList className="grid w-full md:w-[400px] grid-cols-2">
        <TabsTrigger value="reports" className="flex items-center gap-2">
          <FileIcon className="h-4 w-4" />
          <span>Research Reports</span>
          <Skeleton className="h-4 w-8 ml-1" />
        </TabsTrigger>
        <TabsTrigger value="predictions" className="flex items-center gap-2">
          <LineChartIcon className="h-4 w-4" />
          <span>Price Predictions</span>
          <Skeleton className="h-4 w-8 ml-1" />
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="reports" className="mt-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { duration: 1, repeat: Infinity, ease: "linear" }
              }}
              className="relative"
            >
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></div>
            </motion.div>
            <p className="text-muted-foreground">Loading your saved reports...</p>
            <p className="text-xs text-muted-foreground/70">This should only take a moment</p>
          </div>
        </div>
      </TabsContent>
      
      <TabsContent value="predictions" className="mt-6">
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <motion.div
              animate={{ 
                rotate: 360,
                transition: { duration: 1, repeat: Infinity, ease: "linear" }
              }}
              className="relative"
            >
              <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></div>
            </motion.div>
            <p className="text-muted-foreground">Loading your saved predictions...</p>
            <p className="text-xs text-muted-foreground/70">This should only take a moment</p>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  </motion.div>
);

export default SavedContentLoader;
