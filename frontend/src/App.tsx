
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { SimulationProvider } from "@/contexts/SimulationContext";
import { SimulationHistoryProvider } from "@/contexts/SimulationHistoryContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import Navbar from "@/components/Navbar";
import { LazyPage } from "@/components/LazyPage";
import {
  LazyIndex,
  LazySimulate,
  LazyReport,
  LazySavedResults,
  LazySimulationHistory,
  LazyLogin,
  LazySignup,
  LazyNotFound
} from "./pages/lazy";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AuthProvider>
        <SimulationHistoryProvider>
          <SimulationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <Navbar />
              <Routes>
                <Route path="/" element={<LazyPage><LazyIndex /></LazyPage>} />
                <Route path="/auth/login" element={<LazyPage><LazyLogin /></LazyPage>} />
                <Route path="/auth/signup" element={<LazyPage><LazySignup /></LazyPage>} />
                <Route path="/simulate" element={<LazyPage><LazySimulate /></LazyPage>} />
                <Route 
                  path="/saved-results" 
                  element={
                    <LazyPage>
                      <ProtectedRoute>
                        <LazySavedResults />
                      </ProtectedRoute>
                    </LazyPage>
                  } 
                />
                <Route 
                  path="/simulation-history" 
                  element={
                    <LazyPage>
                      <ProtectedRoute>
                        <LazySimulationHistory />
                      </ProtectedRoute>
                    </LazyPage>
                  } 
                />
                <Route 
                  path="/report" 
                  element={
                    <LazyPage>
                      <ProtectedRoute>
                        <LazyReport />
                      </ProtectedRoute>
                    </LazyPage>
                  } 
                />
                <Route path="*" element={<LazyPage><LazyNotFound /></LazyPage>} />
              </Routes>
            </BrowserRouter>
          </SimulationProvider>
        </SimulationHistoryProvider>
      </AuthProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
