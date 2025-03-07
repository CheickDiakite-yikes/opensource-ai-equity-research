
import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter as Router } from "react-router-dom";
import App from './App.tsx'
import './index.css'
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { initializeDatabaseStructure } from '@/services/admin/databaseOptimizer';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000, // 5 minutes
      refetchOnWindowFocus: false,
      retry: 2,
    },
  },
});

// Run database optimization on app startup (fire and forget)
(() => {
  setTimeout(() => {
    initializeDatabaseStructure().catch(error => {
      console.error("Failed to initialize database structure:", error);
    });
  }, 2000); // Delay to not block initial rendering
})();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <Router>
          <App />
          <Toaster />
        </Router>
      </ThemeProvider>
    </QueryClientProvider>
  </React.StrictMode>,
)
