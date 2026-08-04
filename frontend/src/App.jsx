import { lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HeartPulse } from "lucide-react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";

const Dashboard = lazy(() => import("./pages/Dashboard"));
const Today = lazy(() => import("./pages/Today"));
const Journal = lazy(() => import("./pages/Journal"));
const ComingSoon = lazy(() => import("./pages/ComingSoon"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const Learning = lazy(() => import("./pages/Learning"));
const LearningDetails = lazy(() => import("./pages/LearningDetails"));
const Settings = lazy(() => import("./pages/Settings"));
const Progress = lazy(() => import("./pages/Progress"));

function RouteLoadingFallback() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base-950 text-sm text-ink-400">
      Loading…
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/today" element={<Today />} />
          <Route path="/journal" element={<Journal />} />
          <Route path="/learning" element={<Learning />} />

          <Route
            path="/health"
            element={
              <ComingSoon
                icon={HeartPulse}
                title="Health"
                description="Workout and water logs will get their own detailed view here soon — quick actions on Home already track them day to day."
              />
            }
          />

          <Route path="/progress" element={<Progress />} />

          <Route path="/settings" element={<Settings />} />

          <Route path="/learning/:id" element={<LearningDetails />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
