
import React from "react";
import { motion } from "framer-motion";
import { ArrowDown, LineChart, Search, BrainCog } from "lucide-react";
import { Button } from "@/components/ui/button";

const HeroSection: React.FC = () => {
  return (
    <section className="relative overflow-hidden py-16 md:py-24">
      {/* Subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background to-slate-50/30 dark:from-background dark:to-slate-900/30 -z-10" />
      
      {/* Decorative elements */}
      <div className="absolute inset-0 overflow-hidden -z-10">
        <div className="absolute top-1/4 right-1/4 w-64 h-64 rounded-full bg-blue-100/30 dark:bg-blue-900/20 blur-3xl" />
        <div className="absolute bottom-1/3 left-1/3 w-72 h-72 rounded-full bg-purple-100/30 dark:bg-purple-900/20 blur-3xl" />
      </div>
      
      <div className="max-w-4xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="flex justify-center items-center gap-2 mb-2"
          >
            <div className="p-2 rounded-full bg-blue-50 dark:bg-blue-900/30">
              <BrainCog className="h-6 w-6 text-blue-500 dark:text-blue-400" />
            </div>
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI-Powered Research</span>
          </motion.div>
          
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight leading-tight">
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-600 dark:from-blue-400 dark:via-blue-500 dark:to-indigo-400">
              Equity Research
            </span>
            <br />
            <span className="text-foreground">
              Reimagined with AI
            </span>
          </h1>
          
          <motion.p 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Leverage advanced AI algorithms to generate institutional-quality research, 
            perform deep fundamental analysis, and discover alpha-generating insights.
          </motion.p>
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex flex-wrap gap-4 justify-center pt-4"
          >
            <Button size="lg" className="rounded-full px-8 shadow-md">
              Get Started
            </Button>
            <Button variant="outline" size="lg" className="rounded-full px-8">
              Learn More
            </Button>
          </motion.div>
        </motion.div>
        
        {/* Subtle animated indicator */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1, duration: 0.6 }}
          className="mt-16 flex justify-center"
        >
          <motion.div
            animate={{ y: [0, 8, 0] }}
            transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
          >
            <ArrowDown className="h-6 w-6 text-muted-foreground/60" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;
