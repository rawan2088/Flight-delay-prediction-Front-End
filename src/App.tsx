import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Header from "./Components/Header";
import Footer from "./Components/Footer";
import ProtectedRoute from "./Components/ProtectedRoute";
import LandingPage from "./Pages/LandingPage";
import UserPage from "./Pages/UserPage";
import LoginPage from "./Pages/LoginPage";
import RegisterPage from "./Pages/RegisterPage";
import HistoryPage from "./Pages/HistoryPage";
import ProfilePage from "./Pages/ProfilePage";
import { AuthProvider } from "./context/AuthContext";
import ScrollToTop from "./utils/ScrollToTop";

import StarField from "./Components/StarField";
import { Outlet } from "react-router-dom";

// Night sky behind whatever child route is rendered
const StarLayout: React.FC = () => (
  <div className="relative min-h-screen">
    <StarField />
    <div className="relative z-10">
      <Outlet />
    </div>
  </div>
);

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Header />
        <main className="flex-grow">
          <ScrollToTop />

          <Routes>
            <Route element={<StarLayout />}>
              <Route path="/" element={<LandingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route element={<ProtectedRoute />}>
                <Route path="/predict" element={<UserPage />} />
                <Route path="/history" element={<HistoryPage />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
