import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import App from "./App.jsx";
import Home from "./pages/Home.jsx";
import "./index.css";
import { AnimatePresence } from "framer-motion";
import ServiceOptionsPage from './pages/ServiceOptionsPage';
import GuestInfoPage from './pages/GuestInfoPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserAccountPage from './pages/UserAccountPage';
import OverviewSection from './pages/account/OverviewSection.jsx';
import ReservationsSection from './pages/account/UserReservations.jsx';
import { AuthProvider } from './contexts/AuthContext';
import UserAccount from './pages/account/UserAccountPage.jsx';
import StayPreferencesSection from './pages/account/StayPreferencesSection.jsx';
import "./i18n"; // ✅ initialize i18n config
import PaymentConfirmationPage from './pages/PaymentConfirmationPage.jsx';
import BookingSuccessPage from './pages/BookingSuccessPage.jsx';
import ModifyReservationPage from './pages/ModifyReservationPage';
import ModifyConfirmationPage from './pages/ModifyConfirmationPage.jsx';
import ModifySuccessPage from './pages/ModifySuccessPage.jsx';
import { SelectedRoomsProvider } from './contexts/SelectedRoomsContext';
import TokenLogin from './pages/TokenLogin.jsx';

function RouterApp() {
  const location = useLocation();
  React.useEffect(() => {
    const excludedPaths = ['/login', '/register'];
    if (!excludedPaths.includes(location.pathname)) {
      localStorage.setItem('lastVisitedPath', location.pathname);
      console.log('Saved last visited path:', location.pathname);
    }
  }, [location.pathname]);
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="/service-options" element={<ServiceOptionsPage />} />
          <Route path="/guest-info" element={<GuestInfoPage />} />
          <Route path="/modify-reservation/:id" element={<ModifyReservationPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/token-login" element={<TokenLogin />} />
          <Route path="/confirmation" element={<PaymentConfirmationPage />} />
          <Route path="/modification-confirmation" element={<ModifyConfirmationPage />} />
          <Route path="/modification-success/:bookingId" element={<ModifySuccessPage />} />
          <Route path="/booking-success/:bookingId" element={<BookingSuccessPage />} />
          <Route path="/account" element={<UserAccountPage />}>
            <Route index element={<OverviewSection />} />
            <Route path="reservations" element={<ReservationsSection />} />
            <Route path="information" element={<UserAccount />} />
          
            <Route path="loyalty" element={<div>Your Loyalty Account</div>} />
            <Route path="points" element={<div>Your Points Statement</div>} />
            <Route path="stay-preferences" element={<StayPreferencesSection />} />
            <Route path="communication" element={<div>Your Communication Preferences</div>} />
          </Route>
        </Route>
      </Routes>
    </AnimatePresence>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <AuthProvider>
      <SelectedRoomsProvider>
        <RouterApp />
      </SelectedRoomsProvider>
    </AuthProvider>
  </BrowserRouter>
);
