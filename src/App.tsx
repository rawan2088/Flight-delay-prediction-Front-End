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

const App: React.FC = () => (
  <AuthProvider>
    <BrowserRouter>
      <div className="min-h-screen flex flex-col bg-slate-900">
        <Header />
        <main className="flex-grow">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route element={<ProtectedRoute />}>
              <Route path="/predict" element={<UserPage />} />
              <Route path="/history" element={<HistoryPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Routes>
        </main>
        <Footer />
      </div>
    </BrowserRouter>
  </AuthProvider>
);

export default App;
