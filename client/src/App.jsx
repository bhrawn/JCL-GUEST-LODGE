import { Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import BranchRooms from './pages/BranchRooms';
import BookingForm from './pages/BookingForm';
import Confirmation from './pages/Confirmation';
import PaymentVerify from './pages/PaymentVerify';
import RoomDetail from './pages/RoomDetail';
import AdminLogin from './pages/AdminLogin';
import AdminDashboard from './pages/AdminDashboard';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
  return null;
}

export default function App() {
  return (
    <div className="app">
      <ScrollToTop />
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/branches/:id" element={<BranchRooms />} />
          <Route path="/rooms/:roomId" element={<RoomDetail />} />
          <Route path="/book/:roomId" element={<BookingForm />} />
          <Route path="/booking/:reference" element={<Confirmation />} />
          <Route path="/payment/verify" element={<PaymentVerify />} />
          <Route path="/admin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
