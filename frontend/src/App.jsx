import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HeartPulse, LineChart } from "lucide-react";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import Dashboard from "./pages/Dashboard";
import Today from "./pages/Today";
import Journal from "./pages/Journal";
import ComingSoon from "./pages/ComingSoon";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Learning from "./pages/Learning";
import LearningDetails from "./pages/LearningDetails";
import Settings from "./pages/Settings";
import Progress from "./pages/Progress";

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
      </Routes>
    </BrowserRouter>
  );
}
