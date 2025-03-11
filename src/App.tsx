
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AnalyticsProvider } from "./components/analytics/AnalyticsProvider";
import { Toaster } from "./components/ui/toaster";

// Pages
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import SavedContent from "./pages/SavedContent";
import NotFound from "./pages/NotFound";

// Protected routes
import ProtectedRoute from "./components/auth/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AnalyticsProvider>
          <Router>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/auth" element={<Auth />} />
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <Profile />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/saved-content"
                element={
                  <ProtectedRoute>
                    <SavedContent />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
          <Toaster />
        </AnalyticsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
