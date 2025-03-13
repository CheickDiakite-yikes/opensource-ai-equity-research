
import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AnimatePresence } from "framer-motion";
import AppHeader from "@/components/layout/AppHeader";
import SavedContentLoader from "@/components/saved-content/SavedContentLoader";
import SavedContentMain from "@/components/saved-content/SavedContentMain";
import { useSavedContentPage } from "@/hooks/saved-content/useSavedContentPage";
import { featuredSymbols } from "@/constants/featuredSymbols";

const SavedContent = () => {
  const { user, isLoading: authLoading } = useAuth();
  const {
    isLoading,
    isRefreshing,
    reports,
    predictions,
    selectedReport,
    selectedPrediction,
    activeTab,
    setActiveTab,
    reportsError,
    reportsLastError,
    reportsDebugInfo,
    predictionsError,
    predictionsLastError,
    predictionsDebugInfo,
    connectionStatus,
    handleSelectReport,
    handleSelectPrediction,
    handleDeleteReport,
    handleDeletePrediction,
    handleDownloadHtml,
    handleRefresh,
    clearErrors,
    checkConnection
  } = useSavedContentPage();

  // If user is not logged in, redirect to login page
  if (!user && !authLoading) {
    console.log("No user logged in, redirecting to /auth");
    return <Navigate to="/auth" />;
  }

  return (
    <>
      <AppHeader featuredSymbols={featuredSymbols} />
      
      <AnimatePresence>
        {isLoading ? (
          <SavedContentLoader />
        ) : (
          <SavedContentMain
            userEmail={user?.email || null}
            isRefreshing={isRefreshing}
            reports={reports}
            predictions={predictions}
            selectedReport={selectedReport}
            selectedPrediction={selectedPrediction}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            reportsError={reportsError}
            reportsLastError={reportsLastError}
            reportsDebugInfo={reportsDebugInfo}
            predictionsError={predictionsError}
            predictionsLastError={predictionsLastError}
            predictionsDebugInfo={predictionsDebugInfo}
            connectionStatus={connectionStatus}
            onRefresh={handleRefresh}
            onCheckConnection={checkConnection}
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
