import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";
import ProtectedRoute from "./routes/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import DashboardPage from "./pages/DashboardPage";
import HabitsPage from "./pages/HabitsPage";
import GoalsPage from "./pages/GoalsPage";
import WeeklyReviewPage from "./pages/WeeklyReviewPage";
import PublicProfilePage from "./pages/PublicProfilePage";
import LandingPage from "./pages/LandingPage";

const App = () => {
  return (
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/u/:username" element={<PublicProfilePage />} />
            <Route
              path="/dashboard"
              element={<ProtectedRoute><DashboardPage /></ProtectedRoute>}
            />
            <Route
              path="/habits"
              element={<ProtectedRoute><HabitsPage /></ProtectedRoute>}
            />
            <Route
              path="/weekly-review"
              element={<ProtectedRoute><WeeklyReviewPage /></ProtectedRoute>}
            />
            <Route
              path="/goals"
              element={<ProtectedRoute><GoalsPage /></ProtectedRoute>}
            />
          </Routes>
          <Toaster position="top-right" theme="system" />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
