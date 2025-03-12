
import React, { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import AppHeader from "@/components/layout/AppHeader";
import SavedContentLoader from "@/components/saved-content/SavedContentLoader";
import SavedContentMain from "@/components/saved-content/SavedContentMain";
import { useSavedContentPage } from "@/hooks/saved-content/useSavedContentPage";
import { featuredSymbols } from "@/constants/featuredSymbols";
import { toast } from "sonner";

const SavedContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const {
    isLoading,
    isRefreshing,
    reports,
    predictions,
    selectedReport,
    selectedPrediction,
    handleSelectReport,
    handleSelectPrediction,
    handleDeleteReport,
    handleDeletePrediction,
    handleDownloadHtml,
    handleRefresh
  } = useSavedContentPage();

  // Only redirect when authLoading is done and user is null
  if (!user && !authLoading) {
    console.log("No user logged in, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  // If still authenticating, show a simple loader
  if (authLoading) {
    return (
      <>
        <AppHeader featuredSymbols={featuredSymbols} />
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)]">
          <motion.div
            animate={{ 
              rotate: 360,
              transition: { duration: 1, repeat: Infinity, ease: "linear" }
            }}
            className="relative"
          >
            <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent"></div>
          </motion.div>
          <span className="mt-4 text-muted-foreground">Authenticating your account...</span>
        </div>
      </>
    );
  }

  // This will run when the component mounts and we have a valid user
  useEffect(() => {
    if (user && !isLoading && reports.length === 0 && predictions.length === 0) {
      console.log("No saved content found, you can create research reports and predictions to see them here");
      toast.info("No saved content found. Create research reports and predictions to see them here.");
    }
  }, [user, isLoading, reports.length, predictions.length]);

  return (
    <>
      <AppHeader featuredSymbols={featuredSymbols} />
      
      <AnimatePresence mode="sync">
        {isLoading ? (
          <SavedContentLoader key="loader" />
        ) : (
          <SavedContentMain
            key="content"
            userEmail={user?.email || null}
            isRefreshing={isRefreshing}
            reports={reports}
            predictions={predictions}
            selectedReport={selectedReport}
            selectedPrediction={selectedPrediction}
            onRefresh={handleRefresh}
            onSelectReport={handleSelectReport}
            onSelectPrediction={handleSelectPrediction}
            onDeleteReport={handleDeleteReport}
            onDeletePrediction={handleDeletePrediction}
            onDownloadHtml={handleDownloadHtml}
          />
        )}
      </AnimatePresence>
    </>
  );
};

export default SavedContent;
