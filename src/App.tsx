
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from "react-router-dom";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AnalyticsProvider } from "@/components/analytics/AnalyticsProvider";
import { hasReachedFreeLimit } from "@/services/api/userContent/freePredictionsService";
import { useEffect } from "react";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SavedContent from "./pages/SavedContent";
import NotFound from "./pages/NotFound";
import { Starfield } from "./components/ui/starfield";

// Configure React Query with sensible defaults
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 minutes
    },
  },
});

// Track navigation to check free prediction limits
const NavigationTracker = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // If the user is not authenticated and has reached the free limit
    // and they're trying to access a content page, show them a message
    if (!user && hasReachedFreeLimit() && location.pathname === "/" && location.search.includes("symbol=")) {
      const searchParams = new URLSearchParams(location.search);
      const symbol = searchParams.get("symbol");
      
      // If they have a symbol and they're on the stock page, show a toast
      if (symbol) {
        // We'll rely on the component-level checks and toasts
        console.log("User has reached free predictions limit while viewing symbol:", symbol);
      }
    }
  }, [location, user, navigate]);

  return null;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <AuthProvider>
          <AnalyticsProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <NavigationTracker />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/auth" element={<Auth />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/saved-content" element={<SavedContent />} />
                {/* Redirect /stock/:symbol to /?symbol=:symbol */}
                <Route path="/stock/:symbol" element={<Navigate to="/" replace />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </BrowserRouter>
          </AnalyticsProvider>
        </AuthProvider>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
